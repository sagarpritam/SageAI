"""Auto-Fix API Routes — Self-Healing Code endpoint.

Exposes the full SAST → AI Patch → GitHub PR workflow.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import decrypt
from app.core.security import get_current_user
from app.models.organization import Organization
from app.services.tools.sast_scanner import SASTScanner
from app.services.tools.github_pr_tool import GitHubPRTool

router = APIRouter(prefix="/autofix", tags=["Self-Healing Code"])


class AutoFixRequest(BaseModel):
    repository: str = Field(..., description="GitHub repo in 'owner/repo' format")
    branch: str = Field(default="main", description="Branch to scan and fix")
    max_fixes: int = Field(default=5, ge=1, le=20, description="Max number of vulnerabilities to fix")


class AutoFixStatusResponse(BaseModel):
    ready: bool
    message: str


@router.get("/status", response_model=AutoFixStatusResponse)
async def autofix_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if the Self-Healing Code feature is ready (GitHub token configured)."""
    org = await db.get(Organization, current_user["org"])
    if not org or not org.github_token_encrypted:
        return AutoFixStatusResponse(
            ready=False,
            message="GitHub token not configured. Go to Settings → Integrations to connect GitHub."
        )
    return AutoFixStatusResponse(
        ready=True,
        message="Self-Healing Code is ready. You can scan and auto-fix repositories."
    )


@router.post("/run")
async def run_autofix(
    request: AutoFixRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Run the full Self-Healing Code pipeline:
    1. SAST scan the repository
    2. AI generates secure patches for each vulnerability
    3. Opens GitHub Pull Requests with the fixes
    """
    # Verify admin role
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can run auto-fix."
        )

    # Get and decrypt the GitHub token
    org_id = current_user["org"]
    org = await db.get(Organization, org_id)
    if not org or not org.github_token_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub token not configured. Go to Settings → Integrations."
        )

    github_token = decrypt(org.github_token_encrypted)
    if not github_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt GitHub token. Please re-configure it."
        )

    # Step 1: Run SAST Scanner
    sast = SASTScanner()
    scan_results = await sast.run(
        request.repository,
        github_token=github_token,
        branch=request.branch
    )

    if "error" in scan_results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=scan_results["error"]
        )

    findings = scan_results.get("findings", [])
    if not findings:
        return {
            "status": "clean",
            "message": f"No vulnerabilities found in {request.repository}. Your code is secure! 🎉",
            "scan_results": scan_results
        }

    # Limit the number of fixes
    findings_to_fix = findings[:request.max_fixes]

    # Step 2 & 3: Generate patches and open PRs
    pr_tool = GitHubPRTool()
    fix_results = await pr_tool.run(
        request.repository,
        github_token=github_token,
        findings=findings_to_fix,
        branch=request.branch,
        org_id=org_id
    )

    return {
        "status": "completed",
        "scan_results": scan_results,
        "fix_results": fix_results
    }
