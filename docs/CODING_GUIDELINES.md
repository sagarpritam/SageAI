# SageAI Enterprise Coding Guidelines & Architecture Standards

## 1. Core Principles & Philosophy
SageAI is an enterprise-grade AI-powered autonomous security platform combining active reconnaissance, automated vulnerability assessment, multi-agent exploitation verification, deterministic remediation (`SagePatch`), and enterprise observability.

All contributions to SageAI must adhere strictly to these core pillars:
1. **Stateless Compute**: API routes must be ephemeral and stateless to ensure seamless scale-to-zero and Vercel/Cloud Run deployment compatibility.
2. **Strict Multi-Tenant Isolation**: Zero cross-tenant data leakage. Every database query, cache key, and Celery task must be strictly scoped to `organization_id`.
3. **Defense in Depth**: Every external URL input is untrusted and subject to SSRF inspection. Every token is validated with short TTLs and cryptographic signatures.
4. **Deterministic Remediation**: AI assists in patch generation, but patches require strict diff validation, syntax verification, and human approval before production merge.
5. **Rich Aesthetic Standards**: Frontend interfaces must avoid generic utilitarian designs, embracing high-contrast dark modes, glassmorphism, micro-animations, and live telemetric feedback.

---

## 2. Vercel & Stateless Function Rules
Adhere to Vercel and modern serverless application constraints:

- **Stateless & Ephemeral Execution**:
  - Treat HTTP handlers as stateless; never rely on durable in-memory state or background daemon loops inside web endpoints.
  - Offload long-running jobs (scans, fuzzing, large PDF report generation) to Celery workers via Redis queue.
- **Storage & Artifacts**:
  - Do not write persistent data to the local filesystem in production functions.
  - Store generated reports, SBOMs, and exports in Vercel Blob or S3-compatible cloud object storage.
- **Environment & Secrets**:
  - Never commit secrets or `.env` files to git.
  - Secrets must be loaded exclusively through Vercel Environment Variables or runtime secret managers.
  - Client-exposed variables must strictly use `NEXT_PUBLIC_` prefix and never expose private keys or service tokens.
- **AI Gateway & LLM Routing**:
  - Route external LLM calls through verified providers or AI Gateways using timeout-bounded `httpx` async clients with circuit breakers (`app.services.intelligence.circuit_breaker`).

---

## 3. Backend & Security Guardrails (FastAPI / SQLAlchemy)

### 3.1 Multi-Tenant Row-Level Security (RLS)
- Every query operating on tenant data MUST filter by `Scan.organization_id == current_user["org"]` or use the active `OrganizationContextMiddleware`.
- Never trust `org_id` supplied in request bodies or query parameters. Always resolve tenant context from verified JWT claims (`get_current_user`).

```python
# CORRECT: Scoped to verified tenant
result = await db.execute(
    select(Scan).where(
        Scan.id == scan_id,
        Scan.organization_id == current_user["org"]
    )
)
scan = result.scalar_one_or_none()
```

### 3.2 Anti-SSRF & Target Verification
- All endpoints accepting target hostnames or URLs (`/scan`, `/agent/assess`, `/asset-inventory`) MUST validate targets through `is_target_authorized` and `extract_target_domain`.
- Private IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`) must be rejected unless specifically in loopback mock mode.

### 3.3 Dynamic Rate Limiting & Enterprise Quotas
- Rely on `app.core.rate_limit.limiter` with proxy-aware identifier resolution:
  - Default rate limit: `1200/minute`
  - Burst limit: `600/minute`
  - Security scans: `120/minute`
  - Authentication: `60/minute`
- Internal worker requests with valid `x-internal-service` JWT tokens are automatically exempt from client rate limiting.

### 3.4 OpenTelemetry & Prometheus Observability
- All HTTP endpoints pass through `TracingMiddleware` generating W3C `traceparent` headers (`trace_id`, `span_id`).
- Record custom business spans using `record_child_span(name, attributes)`.
- Use `app.services.monitoring.metrics_service` for atomic metrics increments (`scans_total`, `findings_total`, `patches_applied_total`).

---

## 4. Asynchronous Task & Worker Fleet Architecture

- **Celery Task Dispatch**:
  - Dispatch tasks using `.delay()` or `.apply_async()` with explicit queues: `scans`, `recon`, `remediation`, `alerts`.
  - Always pass tenant identifier `org_id` and scan identifier `scan_id` explicitly in task payloads.
- **Graceful Worker Fallback**:
  - When Redis or Celery workers are unreachable, the system automatically falls back to FastAPI `BackgroundTasks` for local/mock development without crashing.
- **Idempotency**:
  - Background workers must be idempotent: checking scan/patch status before execution to prevent duplicate finding generation.

---

## 5. SagePatch Automated Remediation Guidelines

1. **Safety First**:
   - `SagePatch` must never directly overwrite code without prior validation.
2. **Unified Diff Format**:
   - Patches must be generated in strict unified diff format (`--- original`, `+++ patched`, `@@ chunks @@`).
3. **Syntax & AST Validation**:
   - Prior to creating a patch record, test diff application and syntax validity (`python -m py_compile` or language AST parser).
4. **Human-in-the-Loop Approval**:
   - Critical, High, and Medium severity patches default to `requires_approval = True`.
   - Patches cannot be merged or deployed until an authenticated organization user triggers `/autofix/approve/{patch_id}`.
5. **Rollback Capability**:
   - The engine must persist `original_code` and `rollback_diff` to allow zero-downtime reversal via `/autofix/rollback/{patch_id}`.

---

## 6. Frontend Next.js 16 & UI Standards

### 6.1 Component Hierarchy & Client Boundaries
- **Server Components by Default**: Place static or server-rendered layouts in React Server Components.
- **Client Boundaries**: Explicitly mark interactive dashboards, real-time terminals, and charts with `'use client';` at the top of the file.
- **Route Modularization**: Avoid monolithic page files (>500 lines). Break complex dashboards into dedicated components (e.g., `AutoFixPanel.tsx`, `SecurityPosture.tsx`, `LiveAttackMap.tsx`).

### 6.2 Visual Excellence & Theme Guidelines
- Dark cybernetic palette:
  - Background: Obsidian `#030712`, Charcoal `#0B0F19`
  - Surface cards: Glassmorphic borders `border-emerald-500/20` with `bg-slate-900/60 backdrop-blur-md`
  - Accents: Neon Emerald `#10B981` (safe/approved), Electric Cyan `#06B6D4` (recon), Amber `#F59E0B` (warning), Crimson `#EF4444` (critical exploit)
- Micro-interactions:
  - Provide live status indicators, pulse animations for background scans, and tactile feedback on button clicks.

---

## 7. Verification & Code Quality Checklist
Before submitting any pull request or deployment:
- [ ] **Linter**: `python -m ruff check app/` exits 0.
- [ ] **Test Suite**: `python -m pytest tests/` passes 100% of tests (227/227).
- [ ] **Frontend**: `npm run lint` in `sage-web` exits 0 with no syntax/type errors.
- [ ] **No Hardcoded Secrets**: Audit git diff for API keys, bearer tokens, or database passwords.
- [ ] **Documentation**: Maintain docstrings and preserve existing architectural comments.
