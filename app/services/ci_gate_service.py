"""DevSecOps CI/CD Security Quality Gate & Closed-Loop Remediation Service.

Orchestrates:
1. Parallel execution of SAST and Secret scanners
2. Policy evaluation against organization-defined thresholds
3. Automated closed-loop remediation via SagePatch (opening fix PRs)
4. Multi-channel alerting to SecOps / developer channels
5. Immutable audit logging
"""

import asyncio
import logging
import shutil
import subprocess
import tempfile
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.services.alerting.dispatcher import dispatch_security_alert
from app.services.audit_service import log_audit_event
from app.services.tools.github_pr_tool import GitHubPRTool
from app.services.tools.sast_scanner import SASTScanner
from app.services.tools.secret_scanner import SecretScanner

logger = logging.getLogger("SageAI.ci_gate")


def evaluate_gate_policy(
    findings: List[Dict[str, Any]], org: Organization
) -> Dict[str, Any]:
    """Evaluate findings against organization CI policy thresholds."""
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    violations: List[Dict[str, Any]] = []

    fail_on_critical = getattr(org, "ci_fail_on_critical", True)
    fail_on_high = getattr(org, "ci_fail_on_high", True)

    for f in findings:
        sev = str(f.get("severity", "LOW")).lower()
        if sev in counts:
            counts[sev] += 1
        else:
            counts["low"] += 1

        is_violation = False
        if sev == "critical" and fail_on_critical:
            is_violation = True
        elif sev == "high" and fail_on_high:
            is_violation = True

        if is_violation:
            violations.append(f)

    passed = len(violations) == 0

    return {
        "passed": passed,
        "policy": {
            "fail_on_critical": fail_on_critical,
            "fail_on_high": fail_on_high,
        },
        "counts": counts,
        "total_findings": len(findings),
        "total_violations": len(violations),
        "violations": violations,
    }


async def run_parallel_security_matrix(
    repo_target: str,
    github_token: str = "",
    branch: str = "main",
) -> List[Dict[str, Any]]:
    """Clone repository once and execute SAST and Secret scanners in parallel."""
    owner_repo = repo_target.strip("/")
    tmp_dir = tempfile.mkdtemp(prefix="sageai_ci_matrix_")

    try:
        if github_token:
            clone_url = f"https://x-access-token:{github_token}@github.com/{owner_repo}.git"
        else:
            clone_url = f"https://github.com/{owner_repo}.git"

        # Clone repo
        proc = subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", branch, clone_url, tmp_dir],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode != 0:
            logger.warning(f"Failed to clone {owner_repo}: {proc.stderr}")
            return []

        # Run scanners concurrently via asyncio.gather
        sast = SASTScanner()
        secret = SecretScanner()

        # Both tools run in parallel against the cloned workspace
        sast_coro = sast._run_bandit(tmp_dir, owner_repo)
        secret_coro = secret.run(tmp_dir)

        sast_res, secret_res = await asyncio.gather(
            sast_coro, secret_coro, return_exceptions=True
        )

        combined_findings: List[Dict[str, Any]] = []

        if isinstance(sast_res, list):
            combined_findings.extend(sast_res)
        elif isinstance(sast_res, Exception):
            logger.error(f"SAST task failed during matrix: {sast_res}")

        if isinstance(secret_res, dict) and "findings" in secret_res:
            combined_findings.extend(secret_res["findings"])
        elif isinstance(secret_res, Exception):
            logger.error(f"Secret scan task failed during matrix: {secret_res}")

        return combined_findings

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


async def execute_ci_gate_loop(
    db: AsyncSession,
    org: Organization,
    repository: str,
    commit_sha: str,
    branch: str = "main",
    pr_number: Optional[int] = None,
    provided_findings: Optional[List[Dict[str, Any]]] = None,
    trigger_autofix: bool = True,
    user_id: Optional[str] = None,
    client_ip: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute complete DevSecOps closed loop.

    1. Gathers or parallel-scans security findings.
    2. Evaluates against organizational gate policy.
    3. If failed and enabled, triggers SagePatch closed-loop remediation PR.
    4. Dispatches multi-channel alerts and records audit logs.
    """
    from app.core.encryption import decrypt

    github_token = ""
    if org.github_token_encrypted:
        github_token = decrypt(org.github_token_encrypted) or ""

    # 1. Findings collection: use provided or run parallel matrix
    if provided_findings is not None:
        findings = provided_findings
    else:
        findings = await run_parallel_security_matrix(
            repo_target=repository,
            github_token=github_token,
            branch=branch,
        )

    # 2. Gate evaluation
    evaluation = evaluate_gate_policy(findings, org)
    passed = evaluation["passed"]

    remediation_result: Optional[Dict[str, Any]] = None

    # 3. Closed-loop remediation via SagePatch
    should_autofix = (
        not passed
        and trigger_autofix
        and getattr(org, "ci_auto_remediate", False)
        and bool(github_token)
    )

    if should_autofix and evaluation["violations"]:
        logger.info(
            f"CI Gate failed for {repository}@{commit_sha}. Triggering SagePatch auto-remediation..."
        )
        pr_tool = GitHubPRTool()
        try:
            remediation_result = await pr_tool.run(
                repository=repository,
                github_token=github_token,
                findings=evaluation["violations"][:5],
                branch=branch,
                org_id=org.id,
            )
        except Exception as e:
            logger.error(f"SagePatch auto-remediation error: {e}")
            remediation_result = {"error": str(e)}

    # 4. Multi-channel Alerting
    try:
        status_text = "PASSED ✅" if passed else "FAILED ❌"
        title = f"CI Security Gate {status_text}: {repository} ({branch})"
        details = (
            f"Commit: {commit_sha[:8]} | PR: #{pr_number or 'N/A'}\n"
            f"Findings: {evaluation['counts']['critical']} Critical, "
            f"{evaluation['counts']['high']} High, {evaluation['counts']['medium']} Medium."
        )
        if remediation_result and remediation_result.get("pull_requests"):
            fix_urls = [pr["url"] for pr in remediation_result["pull_requests"]]
            details += f"\n🛠️ SagePatch opened remediation PR: {', '.join(fix_urls)}"

        await dispatch_security_alert(
            db=db,
            organization_id=org.id,
            title=title,
            target=f"https://github.com/{repository}/commit/{commit_sha}",
            severity="critical" if evaluation["counts"]["critical"] > 0 else "high" if not passed else "info",
            risk_score=90.0 if not passed else 10.0,
            details=details,
            findings_count=len(findings),
            metadata={
                "commit_sha": commit_sha,
                "repository": repository,
                "passed": passed,
                "violations_count": len(evaluation["violations"]),
            },
        )
    except Exception as alert_err:
        logger.warning(f"Failed to dispatch CI alert: {alert_err}")

    # 5. Audit Logging
    await log_audit_event(
        db=db,
        organization_id=org.id,
        user_id=user_id,
        action="CI_GATE_EVALUATED",
        resource_type="ci_gate",
        resource_id=commit_sha[:16],
        details={
            "repository": repository,
            "branch": branch,
            "commit_sha": commit_sha,
            "pr_number": pr_number,
            "passed": passed,
            "violations": len(evaluation["violations"]),
            "autofix_triggered": should_autofix,
        },
        ip_address=client_ip,
    )

    return {
        "status": "passed" if passed else "failed",
        "passed": passed,
        "repository": repository,
        "branch": branch,
        "commit_sha": commit_sha,
        "pr_number": pr_number,
        "evaluation": evaluation,
        "remediation": remediation_result,
        "recommendation": (
            "All security checks passed. Approved for merge."
            if passed
            else "Security gate thresholds exceeded. Review blocking findings or merge SagePatch remediation PR."
        ),
    }
