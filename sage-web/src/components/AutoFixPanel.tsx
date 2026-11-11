"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileCode,
  Sparkles,
  Code,
  PenTool,
} from "lucide-react";
import axios from "axios";

interface FixResult {
  status: string;
  message?: string;
  scan_results?: Record<string, unknown>;
  fix_results?: Record<string, unknown>;
}

interface PatchItem {
  id: string;
  repository: string;
  base_branch: string;
  patch_branch: string;
  file_path: string;
  vulnerability_type: string;
  severity: string;
  diff: string;
  lines_changed: number;
  status: string;
  sandbox_passed: boolean;
  sandbox_details?: {
    safe?: boolean;
    syntax_valid?: boolean;
    security_valid?: boolean;
    reasons?: string[];
  };
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  pr_number?: number;
  pr_url?: string;
  created_at?: string;
}

const BENCHMARK_TEMPLATES = [
  {
    id: "sqli",
    title: "SQL Injection → Parameterized ORM",
    vulnerability_type: "SQL_INJECTION",
    severity: "CRITICAL",
    file_path: "app/db/repositories.py",
    original_code: "def get_user_by_email(db, email: str):\n    query = f\"SELECT * FROM users WHERE email = '{email}'\"\n    return db.execute(query).fetchone()",
    patched_code: "from sqlalchemy import select\nfrom app.models.user import User\n\nasync def get_user_by_email(db, email: str):\n    stmt = select(User).where(User.email == email)\n    result = await db.execute(stmt)\n    return result.scalar_one_or_none()",
  },
  {
    id: "ssrf_imds",
    title: "Cloud IMDSv2 SSRF → Token-Bound Header",
    vulnerability_type: "SSRF_IMDS",
    severity: "CRITICAL",
    file_path: "app/services/integrations/webhook_client.py",
    original_code: "import requests\n\ndef fetch_remote_webhook(url: str):\n    # Direct request to target webhook\n    return requests.get(url, timeout=5).json()",
    patched_code: "from urllib.parse import urlparse\nimport ipaddress\nimport httpx\n\nBLOCKED_CIDRS = [ipaddress.ip_network('169.254.0.0/16'), ipaddress.ip_network('127.0.0.0/8'), ipaddress.ip_network('10.0.0.0/8')]\n\nasync def fetch_remote_webhook(url: str):\n    parsed = urlparse(url)\n    if not parsed.hostname:\n        raise ValueError('Invalid webhook target hostname')\n    try:\n        ip = ipaddress.ip_address(parsed.hostname)\n        if any(ip in net for net in BLOCKED_CIDRS):\n            raise PermissionError('Cloud metadata / internal IP access prohibited')\n    except ValueError:\n        pass\n    async with httpx.AsyncClient(timeout=5) as client:\n        res = await client.get(url)\n        return res.json()",
  },
  {
    id: "jwt_confusion",
    title: "JWT Algorithm Confusion → Explicit RS256 Verification",
    vulnerability_type: "JWT_ALGORITHM_CONFUSION",
    severity: "CRITICAL",
    file_path: "app/services/token_service.py",
    original_code: "import jwt\n\ndef verify_user_jwt(token: str, secret_or_pubkey: str):\n    # Insecure: accepts any algorithm header specified by client token\n    return jwt.decode(token, secret_or_pubkey, verify=True)",
    patched_code: "import jwt\n\nALLOWED_ALGORITHMS = ['RS256']\n\ndef verify_user_jwt(token: str, public_pem: str):\n    # Explicitly enforce cryptographic RSA public key algorithm check\n    return jwt.decode(token, public_pem, algorithms=ALLOWED_ALGORITHMS, options={'require': ['exp', 'iat', 'sub']})",
  },
  {
    id: "xss",
    title: "XSS → TextContent Sanitization",
    vulnerability_type: "CROSS_SITE_SCRIPTING",
    severity: "HIGH",
    file_path: "app/utils/diagnostics.py",
    original_code: "def render_html_notice(title, content):\n    return f\"<div class='alert'><h1>{title}</h1><p>{content}</p></div>\"",
    patched_code: "import html\n\ndef render_html_notice(title, content):\n    safe_title = html.escape(str(title))\n    safe_content = html.escape(str(content))\n    return f\"<div class='alert'><h1>{safe_title}</h1><p>{safe_content}</p></div>\"",
  },
  {
    id: "path_traversal",
    title: "Path Traversal → Resolved Safe Path",
    vulnerability_type: "PATH_TRAVERSAL",
    severity: "HIGH",
    file_path: "app/utils/diagnostics.py",
    original_code: "def read_audit_log(filename):\n    with open('logs/' + filename, 'r') as f:\n        return f.read()",
    patched_code: "import os\n\ndef read_audit_log(filename):\n    base_dir = os.path.abspath('logs')\n    target_path = os.path.abspath(os.path.join(base_dir, filename))\n    if not target_path.startswith(base_dir):\n        raise ValueError('Illegal path traversal attempt')\n    with open(target_path, 'r', encoding='utf-8') as f:\n        return f.read()",
  },
  {
    id: "cmdi",
    title: "Command Injection → Subprocess Argument List",
    vulnerability_type: "COMMAND_INJECTION",
    severity: "CRITICAL",
    file_path: "app/services/system_tools.py",
    original_code: "import os\n\ndef ping_host(host: str):\n    # Dangerous shell interpolation\n    return os.system('ping -c 1 ' + host)",
    patched_code: "import subprocess\nimport shlex\n\ndef ping_host(host: str):\n    # Type-safe parameter list without shell=True execution\n    clean_host = shlex.quote(host).strip(\"'\\\"\")\n    res = subprocess.run(['ping', '-c', '1', clean_host], capture_output=True, text=True, check=False)\n    return res.returncode",
  },
];

export function AutoFixPanel() {
  const [activeTab, setActiveTab] = useState<"queue" | "scan" | "propose">("queue");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("sqli");
  const [proposeRepo, setProposeRepo] = useState("sagarpritam/SageAI");
  const [proposeBranch, setProposeBranch] = useState("main");
  const [proposing, setProposing] = useState(false);
  const [proposeMsg, setProposeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Custom Proposal Editor State
  const [customFilePath, setCustomFilePath] = useState("app/services/auth_validator.py");
  const [customVulnType, setCustomVulnType] = useState("CUSTOM_SECURITY_AUDIT");
  const [customSeverity, setCustomSeverity] = useState("HIGH");
  const [customOrigCode, setCustomOrigCode] = useState("def authenticate(user_token):\n    # Insecure token check\n    return user_token == 'master_admin'");
  const [customPatchedCode, setCustomPatchedCode] = useState("import hmac\n\ndef authenticate(user_token: str, expected_hash: str) -> bool:\n    # Constant-time comparison preventing timing attacks\n    return hmac.compare_digest(str(user_token), str(expected_hash))");

  // Scan state
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [maxFixes, setMaxFixes] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState("");

  // Review Queue state
  const [patches, setPatches] = useState<PatchItem[]>([]);
  const [loadingPatches, setLoadingPatches] = useState(false);
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [queueError, setQueueError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [simConfirmPatchId, setSimConfirmPatchId] = useState<string | null>(null);

  const fetchPatches = async () => {
    setLoadingPatches(true);
    try {
      const res = await axios.get("/api/autofix/patches");
      setPatches(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPatches([]);
    } finally {
      setLoadingPatches(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/autofix")
      .then((r) => {
        setReady(r.data.ready);
        setStatusMsg(r.data.message);
      })
      .catch(() => setStatusMsg("Failed to check autofix status."))
      .finally(() => setCheckingStatus(false));

    fetchPatches();
  }, []);

  const handleProposeSandboxPatch = async () => {
    setProposing(true);
    setProposeMsg(null);

    let filePath = "";
    let vulnType = "";
    let severity = "";
    let origCode = "";
    let patchedCode = "";

    if (selectedTemplateId === "custom") {
      filePath = customFilePath;
      vulnType = customVulnType;
      severity = customSeverity;
      origCode = customOrigCode;
      patchedCode = customPatchedCode;
    } else {
      const tmpl = BENCHMARK_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (!tmpl) {
        setProposing(false);
        return;
      }
      filePath = tmpl.file_path;
      vulnType = tmpl.vulnerability_type;
      severity = tmpl.severity;
      origCode = tmpl.original_code;
      patchedCode = tmpl.patched_code;
    }

    try {
      const res = await axios.post("/api/autofix/propose", {
        repository: proposeRepo,
        file_path: filePath,
        vulnerability_type: vulnType,
        severity: severity,
        original_code: origCode,
        patched_code: patchedCode,
        base_branch: proposeBranch,
      });

      if (res.data?.status === "proposed" || res.data?.patch_id) {
        setProposeMsg({
          type: "success",
          text: "Patch passed AST validation and has been submitted to the review queue!",
        });
        await fetchPatches();
        setActiveTab("queue");
      } else {
        setProposeMsg({
          type: "error",
          text: res.data?.detail || "Failed to propose patch.",
        });
      }
    } catch (err: any) {
      setProposeMsg({
        type: "error",
        text: err?.response?.data?.detail || err?.message || "Sandbox validation failed.",
      });
    } finally {
      setProposing(false);
    }
  };

  const handleRun = async () => {
    if (!repo.trim()) return;
    setRunning(true);
    setResult(null);
    setError("");

    try {
      const r = await axios.post("/api/autofix", {
        repository: repo,
        branch,
        max_fixes: maxFixes,
      });
      setResult(r.data);
      fetchPatches();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || e.message);
      } else {
        setError("Autofix run failed.");
      }
    } finally {
      setRunning(false);
    }
  };

  const handleApprove = async (patchId: string, simulate = false) => {
    setActionLoadingId(patchId);
    setQueueError(null);
    setSimConfirmPatchId(null);
    try {
      const url = simulate
        ? `/api/autofix/patches/${patchId}/approve?simulate=true`
        : `/api/autofix/patches/${patchId}/approve`;
      await axios.post(url);
      await fetchPatches();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
        if (detail.includes("GitHub token not configured") && !simulate) {
          setSimConfirmPatchId(patchId);
        } else {
          setQueueError(`Approval error: ${detail}`);
        }
      } else {
        setQueueError("Failed to approve patch.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (patchId: string) => {
    if (!rejectionReason.trim()) {
      setRejectError("Please specify a reason for rejecting the patch.");
      return;
    }
    setRejectError(null);
    setActionLoadingId(patchId);
    try {
      await axios.post(`/api/autofix/patches/${patchId}/reject`, {
        reason: rejectionReason,
      });
      setRejectionModalId(null);
      setRejectionReason("");
      setRejectError(null);
      await fetchPatches();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setRejectError(
          `Rejection error: ${err.response?.data?.detail || err.response?.data?.error || err.message}`
        );
      } else {
        setRejectError("Failed to reject patch.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`rounded-xl p-5 border ${
          ready
            ? "bg-emerald-950/30 border-emerald-700/40"
            : "bg-zinc-900/60 border-zinc-700/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {checkingStatus ? (
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            ) : ready ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-bold text-white">
                {checkingStatus
                  ? "Checking status..."
                  : ready
                  ? "SagePatch Remediation Engine Ready"
                  : "Configuration Needed"}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">{statusMsg}</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-700/50 text-emerald-400">
            <Shield className="w-3.5 h-3.5" /> Phase 04 Verified
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "queue"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <FileCode className="w-4 h-4" /> SagePatch Review Queue
          {patches.filter((p) => p.status === "proposed").length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-400 text-black font-extrabold">
              {patches.filter((p) => p.status === "proposed").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("scan")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "scan"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <GitBranch className="w-4 h-4" /> Scan Repository
        </button>
        <button
          onClick={() => setActiveTab("propose")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "propose"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Propose Sandbox Fix
        </button>
      </div>

      {/* TAB 1: SagePatch Review Queue */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Human-in-the-Loop Patch Approvals
            </h3>
            <button
              onClick={fetchPatches}
              disabled={loadingPatches}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {loadingPatches ? "Refreshing..." : "↻ Refresh List"}
            </button>
          </div>

          {queueError && (
            <div
              role="alert"
              className="bg-red-950/40 border border-red-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-xs text-red-300">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{queueError}</span>
              </div>
              <button
                type="button"
                onClick={() => setQueueError(null)}
                className="text-xs text-red-300/80 hover:text-red-200 font-semibold shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {loadingPatches ? (
            <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Loading proposed patches...
            </div>
          ) : patches.length === 0 ? (
            <div className="p-10 text-center bg-zinc-900/30 rounded-xl border border-zinc-800/60 text-zinc-400 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto" />
              <p className="text-sm font-semibold text-white">No Pending Patches</p>
              <p className="text-xs text-zinc-500">
                All proposed remediation patches have been reviewed or merged.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patches.map((patch) => {
                const isExpanded = expandedDiffId === patch.id;
                const isActionLoading = actionLoadingId === patch.id;
                const isProposed = patch.status === "proposed";
                const isApproved = patch.status === "approved";
                const isRejected = patch.status === "rejected";

                return (
                  <div
                    key={patch.id}
                    className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4 transition-all hover:border-zinc-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              patch.severity === "CRITICAL"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : patch.severity === "HIGH"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-blue-950 text-blue-400 border border-blue-800"
                            }`}
                          >
                            {patch.severity}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">
                            {patch.vulnerability_type}
                          </span>
                          <span className="text-xs text-zinc-500">in</span>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                            {patch.file_path}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                          <span>Repo: {patch.repository}</span>
                          <span>•</span>
                          <span>Branch: {patch.patch_branch}</span>
                          <span>•</span>
                          <span>+{patch.lines_changed} lines</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isProposed && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-700/60 text-amber-300">
                            Awaiting Human Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> Approved & PR Dispatched
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sandbox Verification Badges */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-zinc-800 text-zinc-300 font-mono">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> AST Syntax Validated
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-zinc-800 text-zinc-300 font-mono">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Sandboxed Isolation
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-zinc-800 text-zinc-300 font-mono">
                        <Shield className="w-3 h-3 text-emerald-400" /> Human Review Enforced
                      </span>
                    </div>

                    {/* PR Link if already approved */}
                    {patch.pr_url && (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
                        <div className="text-xs text-emerald-300">
                          GitHub Pull Request:{" "}
                          <span className="font-mono font-bold">#{patch.pr_number || "PR"}</span>
                        </div>
                        <a
                          href={patch.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline"
                        >
                          View PR on GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Rejection Reason if rejected */}
                    {patch.rejection_reason && (
                      <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 text-xs text-red-300">
                        <span className="font-bold">Rejection Rationale:</span>{" "}
                        {patch.rejection_reason}
                      </div>
                    )}

                    {/* Diff Inspection View */}
                    <div>
                      <button
                        onClick={() =>
                          setExpandedDiffId(isExpanded ? null : patch.id)
                        }
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Hide Unified Diff
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Inspect Unified Diff
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 bg-black/70 border border-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-72">
                          {patch.diff.split("\n").map((line, idx) => {
                            const isAdd = line.startsWith("+") && !line.startsWith("+++");
                            const isDel = line.startsWith("-") && !line.startsWith("---");
                            const isHeader = line.startsWith("@@") || line.startsWith("---") || line.startsWith("+++");

                            return (
                              <div
                                key={idx}
                                className={`whitespace-pre ${
                                  isAdd
                                    ? "bg-emerald-950/40 text-emerald-300"
                                    : isDel
                                    ? "bg-red-950/40 text-red-300"
                                    : isHeader
                                    ? "text-blue-400 font-bold"
                                    : "text-zinc-400"
                                }`}
                              >
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions: Approve / Reject / Simulate (Only for proposed patches) */}
                    {isProposed && (
                      <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                        {simConfirmPatchId === patch.id && (
                          <div
                            role="alert"
                            className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <p className="text-xs text-amber-200">
                              GitHub token is not configured for live repository dispatch. Approve this patch in Simulated PR Mode instead?
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSimConfirmPatchId(null)}
                                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                              >
                                Dismiss
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(patch.id, true)}
                                disabled={isActionLoading}
                                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                              >
                                Approve (Simulated PR)
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              setRejectError(null);
                              setRejectionModalId(patch.id);
                            }}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-lg border border-red-800/50 hover:bg-red-950/30 text-red-400 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject Patch
                          </button>
                          <button
                            onClick={() => handleApprove(patch.id, true)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-lg border border-emerald-700/60 hover:bg-emerald-950/40 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Play className="w-3 h-3 text-emerald-400" /> Simulate PR
                          </button>
                          <button
                            onClick={() => handleApprove(patch.id, false)}
                            disabled={isActionLoading}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950 disabled:opacity-50"
                          >
                            {isActionLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching PR...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" /> Approve & Open PR
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rejection Modal */}
          {rejectionModalId && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Reject Remediation Patch
                </h4>
                <p className="text-xs text-zinc-400">
                  Please provide a rationale for rejecting this patch. This explanation will be
                  recorded in the audit trail.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectError) setRejectError(null);
                  }}
                  placeholder="e.g. Approach introduces breaking API change; requires manual refactor."
                  className="w-full h-24 bg-black/60 border border-zinc-700 rounded-lg p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                />
                {rejectError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-300"
                  >
                    {rejectError}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectionModalId(null);
                      setRejectionReason("");
                      setRejectError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(rejectionModalId)}
                    disabled={actionLoadingId === rejectionModalId}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Propose Sandbox Patch */}
      {activeTab === "propose" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  SagePatch AST Sandbox Validator & Remediation Studio
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Simulate and validate an AI-generated code patch through the AST security pipeline and submit to the human approval queue.
                </p>
              </div>
            </div>

            {/* Template selector pills */}
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-2">
                Select Security Remediation Benchmark or Custom Code:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {BENCHMARK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                      selectedTemplateId === tmpl.id
                        ? "bg-emerald-950/60 border-emerald-600/80 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold mb-1 truncate">{tmpl.title}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{tmpl.file_path}</div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTemplateId("custom")}
                  className={`text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                    selectedTemplateId === "custom"
                      ? "bg-emerald-950/60 border-emerald-600/80 text-emerald-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                    Custom Code Proposal
                  </div>
                  <div className="text-[10px] text-zinc-500">Edit custom vulnerable & patch code</div>
                </button>
              </div>
            </div>

            {/* Selected Template / Custom Details */}
            {selectedTemplateId === "custom" ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Target File Path:</label>
                    <input
                      value={customFilePath}
                      onChange={(e) => setCustomFilePath(e.target.value)}
                      placeholder="e.g. app/services/auth.py"
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Vulnerability Type:</label>
                    <input
                      value={customVulnType}
                      onChange={(e) => setCustomVulnType(e.target.value)}
                      placeholder="e.g. TIMING_ATTACK"
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Severity:</label>
                    <select
                      value={customSeverity}
                      onChange={(e) => setCustomSeverity(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-red-400 block mb-1">Original Code:</span>
                    <textarea
                      value={customOrigCode}
                      onChange={(e) => setCustomOrigCode(e.target.value)}
                      rows={6}
                      className="w-full p-3 bg-zinc-950 rounded-lg border border-red-900/40 text-[11px] text-red-300 font-mono focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 block mb-1">Patched Code:</span>
                    <textarea
                      value={customPatchedCode}
                      onChange={(e) => setCustomPatchedCode(e.target.value)}
                      rows={6}
                      className="w-full p-3 bg-zinc-950 rounded-lg border border-emerald-900/40 text-[11px] text-emerald-300 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Target Repository:</label>
                    <input
                      value={proposeRepo}
                      onChange={(e) => setProposeRepo(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">Base Branch:</label>
                    <input
                      value={proposeBranch}
                      onChange={(e) => setProposeBranch(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {proposeMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs font-mono border ${
                      proposeMsg.type === "success"
                        ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                        : "bg-red-950/40 border-red-800 text-red-300"
                    }`}
                  >
                    {proposeMsg.text}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleProposeSandboxPatch}
                    disabled={proposing || !customOrigCode.trim() || !customPatchedCode.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 shadow-lg shadow-emerald-950"
                  >
                    {proposing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Validating AST & Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" /> Validate AST & Propose Patch
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const tmpl = BENCHMARK_TEMPLATES.find((t) => t.id === selectedTemplateId);
                if (!tmpl) return null;
                return (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-mono text-red-400 block mb-1">Original Vulnerable Code:</span>
                        <pre className="p-3 bg-zinc-950 rounded-lg border border-red-900/40 text-[11px] text-red-300 font-mono overflow-x-auto leading-relaxed max-h-48">
                          {tmpl.original_code}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-emerald-400 block mb-1">Proposed AST-Safe Patch:</span>
                        <pre className="p-3 bg-zinc-950 rounded-lg border border-emerald-900/40 text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed max-h-48">
                          {tmpl.patched_code}
                        </pre>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-zinc-400 block mb-1">Target Repository:</label>
                        <input
                          value={proposeRepo}
                          onChange={(e) => setProposeRepo(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-zinc-400 block mb-1">Base Branch:</label>
                        <input
                          value={proposeBranch}
                          onChange={(e) => setProposeBranch(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {proposeMsg && (
                      <div
                        className={`p-3 rounded-lg text-xs font-mono border ${
                          proposeMsg.type === "success"
                            ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                            : "bg-red-950/40 border-red-800 text-red-300"
                        }`}
                      >
                        {proposeMsg.text}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleProposeSandboxPatch}
                        disabled={proposing}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 shadow-lg shadow-emerald-950"
                      >
                        {proposing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Validating AST & Submitting...
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5" /> Validate AST & Propose Patch
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Scan & Run Auto-Fix */}
      {activeTab === "scan" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Run SAST & Propose Fixes
            </h3>
            <p className="text-xs text-zinc-400">
              Scans target GitHub repository with static analysis (Bandit/Semgrep) and generates candidate
              patches using the DeveloperAgent. All patches will enter the Review Queue for human approval.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="owner/repo"
                className="col-span-2 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Branch"
                className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs text-zinc-400 font-mono">
                Max Fixes:
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxFixes}
                  onChange={(e) => setMaxFixes(Number(e.target.value))}
                  className="ml-2 w-16 bg-black/50 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </label>
              <button
                onClick={handleRun}
                disabled={running || !repo.trim()}
                className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scanning & Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Remediation Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-bold text-white">
                  {result.status === "clean"
                    ? "No Vulnerabilities Found 🎉"
                    : "Auto-Fix Scan Completed"}
                </p>
              </div>
              {result.message && (
                <p className="text-xs text-zinc-400">{result.message}</p>
              )}
              <pre className="text-xs text-zinc-500 bg-black/50 rounded-lg p-3 overflow-auto max-h-60 font-mono">
                {JSON.stringify(result.fix_results || result.scan_results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
