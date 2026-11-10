import { NextResponse } from "next/server";

export const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

export const SAFE_EXPORT_FORMATS = new Set([
  "json",
  "csv",
  "pdf",
  "sarif",
  "markdown",
  "md",
  "html",
  "xml",
]);

export const ALLOWED_POSTURE_FRAMEWORKS = new Set([
  "owasp",
  "pci_dss",
  "soc2",
  "nist",
  "iso27001",
]);

export const ALLOWED_COMPLIANCE_QUERY_FRAMEWORKS = new Set([
  "soc2",
  "pci-dss",
  "pci_dss",
  "owasp",
  "hipaa",
  "iso27001",
  "gdpr",
  "nist",
]);

export const ALLOWED_ORG_ROLES = new Set(["admin", "member"]);

/**
 * Validates path/query resource identifiers (UUIDs, scan IDs, CVE IDs, numeric IDs, etc.)
 * to block path traversal (`..`, `/`, `\`, encoded separators) before interpolating into upstream URLs.
 */
export function isValidResourceId(value: unknown): value is string {
  return typeof value === "string" && SAFE_ID_RE.test(value);
}

/**
 * Validates export format values before using them in Content-Disposition headers.
 * Defaults empty/missing values to "json"; returns null for invalid/unsafe values.
 */
export function sanitizeExportFormat(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return "json";
  }
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return SAFE_EXPORT_FORMATS.has(normalized) ? normalized : null;
}

/**
 * Sanitizes an identifier prefix before placing it in Content-Disposition headers.
 */
export function sanitizeFilenamePrefix(
  value: string,
  fallback: string = "scan"
): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return cleaned || fallback;
}

/**
 * Validates catch-all path segments for /api/posture/[...path] against the FastAPI posture router allowlist.
 */
export function isAllowedPosturePath(segments: string[]): boolean {
  if (!Array.isArray(segments) || segments.length === 0 || segments.length > 2) {
    return false;
  }

  for (const seg of segments) {
    if (!seg || seg === "." || seg === ".." || seg.includes("/") || seg.includes("\\")) {
      return false;
    }
  }

  if (segments.length === 1) {
    return segments[0] === "score" || segments[0] === "trends" || segments[0] === "compliance";
  }

  const [head, tail] = segments;
  if (head === "compliance") {
    return tail === "report" || ALLOWED_POSTURE_FRAMEWORKS.has(tail);
  }
  if (head === "remediation" || head === "quick-wins") {
    return isValidResourceId(tail);
  }
  return false;
}

/**
 * Parses an IPv4 dotted-quad string into 4 octets, or returns null if invalid.
 */
function parseIPv4Octets(host: string): [number, number, number, number] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;
  const nums: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    nums.push(n);
  }
  return [nums[0], nums[1], nums[2], nums[3]];
}

/**
 * Checks whether an IPv4 address (4 octets) belongs to a loopback, private, link-local,
 * CGNAT, unspecified, or multicast/reserved range that must never be targeted by SSRF.
 */
function isBlockedIPv4Octets(octets: [number, number, number, number]): boolean {
  const [a, b] = octets;
  if (a === 0) return true; // 0.0.0.0/8 ("this network")
  if (a === 10) return true; // 10.0.0.0/8 (RFC1918)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT / cloud metadata)
  if (a === 127) return true; // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 (RFC1918)
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 (RFC1918)
  if (a >= 224) return true; // Multicast (224.0.0.0/4) & reserved (240.0.0.0/4)
  return false;
}

/**
 * Parses an IPv6 address literal (without brackets) into 8 16-bit hextets, or returns null.
 */
function parseIPv6Hextets(addr: string): number[] | null {
  if (!addr.includes(":")) return null;

  let working = addr.toLowerCase();
  // Convert trailing embedded IPv4 dotted quad if present (e.g. ::ffff:127.0.0.1)
  const lastColon = working.lastIndexOf(":");
  const maybeV4 = working.slice(lastColon + 1);
  if (maybeV4.includes(".")) {
    const octets = parseIPv4Octets(maybeV4);
    if (!octets) return null;
    const hi = ((octets[0] << 8) | octets[1]).toString(16);
    const lo = ((octets[2] << 8) | octets[3]).toString(16);
    working = `${working.slice(0, lastColon)}:${hi}:${lo}`;
  }

  const dblParts = working.split("::");
  if (dblParts.length > 2) return null;

  const parseGroups = (seg: string): number[] | null => {
    if (!seg) return [];
    const items = seg.split(":");
    const out: number[] = [];
    for (const item of items) {
      if (!/^[0-9a-f]{1,4}$/.test(item)) return null;
      out.push(parseInt(item, 16));
    }
    return out;
  };

  if (dblParts.length === 1) {
    const groups = parseGroups(dblParts[0]);
    return groups && groups.length === 8 ? groups : null;
  }

  const left = parseGroups(dblParts[0]);
  const right = parseGroups(dblParts[1]);
  if (!left || !right) return null;
  const missing = 8 - (left.length + right.length);
  if (missing < 1) return null;
  return [...left, ...new Array<number>(missing).fill(0), ...right];
}

/**
 * Checks whether an IPv6 hextet array represents a blocked internal/loopback/link-local/ULA
 * or private IPv4-mapped/compatible/6to4/NAT64 address.
 */
function isBlockedIPv6Hextets(h: number[]): boolean {
  const allZeroPrefix6 =
    h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0;

  // Unspecified :: (0:0:0:0:0:0:0:0) or loopback ::1 (0:0:0:0:0:0:0:1)
  if (allZeroPrefix6 && h[6] === 0 && (h[7] === 0 || h[7] === 1)) {
    return true;
  }

  // Unique Local Addresses fc00::/7 (fc00..fdff)
  if ((h[0] & 0xfe00) === 0xfc00) {
    return true;
  }

  // Link-local fe80::/10 and deprecated site-local fec0::/10
  if ((h[0] & 0xffc0) === 0xfe80 || (h[0] & 0xffc0) === 0xfec0) {
    return true;
  }

  // Multicast ff00::/8
  if ((h[0] & 0xff00) === 0xff00) {
    return true;
  }

  // IPv4-mapped ::ffff:0:0/96 or IPv4-compatible ::/96
  const isV4Mapped =
    h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0xffff;
  if (isV4Mapped || allZeroPrefix6) {
    const octets: [number, number, number, number] = [
      (h[6] >> 8) & 0xff,
      h[6] & 0xff,
      (h[7] >> 8) & 0xff,
      h[7] & 0xff,
    ];
    if (isBlockedIPv4Octets(octets)) return true;
  }

  // Well-known NAT64 prefix 64:ff9b::/96 (embedded IPv4 in h[6..7])
  if (
    h[0] === 0x0064 &&
    h[1] === 0xff9b &&
    h[2] === 0 &&
    h[3] === 0 &&
    h[4] === 0 &&
    h[5] === 0
  ) {
    const octets: [number, number, number, number] = [
      (h[6] >> 8) & 0xff,
      h[6] & 0xff,
      (h[7] >> 8) & 0xff,
      h[7] & 0xff,
    ];
    if (isBlockedIPv4Octets(octets)) return true;
  }

  // 6to4 prefix 2002::/16 (embedded IPv4 in h[1..2])
  if (h[0] === 0x2002) {
    const octets: [number, number, number, number] = [
      (h[1] >> 8) & 0xff,
      h[1] & 0xff,
      (h[2] >> 8) & 0xff,
      h[2] & 0xff,
    ];
    if (isBlockedIPv4Octets(octets)) return true;
  }

  return false;
}

/**
 * Checks whether a parsed URL hostname targets loopback, link-local, metadata,
 * or private internal networks (handles IPv4 and bracketed/hex/mapped IPv6).
 */
export function isBlockedScanHost(rawHostname: string): boolean {
  if (!rawHostname) return true;
  if (rawHostname.includes("%")) return true; // Block IPv6 zone IDs

  let host = rawHostname.trim().toLowerCase();
  if (host.startsWith("[") && host.endsWith("]")) {
    host = host.slice(1, -1);
  }
  host = host.replace(/\.+$/, "");
  if (!host) return true;

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    host === "metadata.goog"
  ) {
    return true;
  }

  const ipv4 = parseIPv4Octets(host);
  if (ipv4) {
    return isBlockedIPv4Octets(ipv4);
  }

  const ipv6 = parseIPv6Hextets(host);
  if (ipv6) {
    return isBlockedIPv6Hextets(ipv6);
  }

  // Block single-label internal hostnames (e.g. "redis", "metadata", "backend")
  if (!host.includes(".")) {
    return true;
  }

  return false;
}

/**
 * Validates and normalizes an external scan target URL, enforcing HTTP(S)
 * and blocking SSRF against private/loopback/link-local IPv4 & IPv6 hosts.
 */
export function validateScanTarget(
  rawTarget: unknown
): { ok: true; url: string } | { ok: false; error: string } {
  if (!rawTarget || typeof rawTarget !== "string") {
    return { ok: false, error: "Target URL or domain is required" };
  }

  let cleanTarget = rawTarget.trim();
  if (!cleanTarget) {
    return { ok: false, error: "Target URL or domain is required" };
  }

  // Only prepend https:// when the user supplied a scheme-less domain/IP.
  // Explicit schemes like ftp://, file://, gopher://, or javascript: must fail protocol checks.
  const hasExplicitScheme =
    cleanTarget.includes("://") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d+(?:$|\/|:|\?|#))/.test(cleanTarget);
  if (!hasExplicitScheme) {
    cleanTarget = `https://${cleanTarget}`;
  }

  try {
    const parsed = new URL(cleanTarget);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ok: false, error: "Only HTTP and HTTPS targets are permitted." };
    }
    if (isBlockedScanHost(parsed.hostname)) {
      return {
        ok: false,
        error: "Scanning private or loopback IP ranges is strictly prohibited.",
      };
    }
    return { ok: true, url: cleanTarget };
  } catch {
    return { ok: false, error: "Invalid target URL format." };
  }
}

/**
 * Decodes a JWT payload segment without signature verification (used only for routing hints).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const raw = Buffer.from(parts[1], "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Parses a required JSON request body, returning a 400 Bad Request NextResponse on failure.
 */
export async function safeJsonBody<T = Record<string, unknown>>(
  req: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const parsed: unknown = await req.json();
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "JSON object payload is required" },
          { status: 400 }
        ),
      };
    }
    return { ok: true, data: parsed as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Parses an optional JSON request body (allows empty body -> {}), returning 400 on malformed JSON.
 */
export async function safeOptionalJsonBody<T = Record<string, unknown>>(
  req: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const text = await req.text();
    if (!text.trim()) {
      return { ok: true, data: {} as T };
    }
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "JSON object payload is required" },
          { status: 400 }
        ),
      };
    }
    return { ok: true, data: parsed as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Safely parses JSON from an upstream FastAPI response, falling back when upstream returns non-JSON.
 */
export async function safeUpstreamJson<T = unknown>(
  res: Response,
  fallback: T
): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Returns true when running in Vercel/CI without a configured BACKEND_URL
 * so proxy handlers fail fast instead of dialing localhost:8000.
 */
export function isStandaloneOfflineMode(): boolean {
  return (
    !process.env.BACKEND_URL &&
    (process.env.VERCEL === "1" || process.env.CI === "true")
  );
}

/**
 * Returns a standardized sanitized 502 Bad Gateway response for unreachable backends.
 */
export function offlineBackendResponse(
  message: string = "Backend service unavailable (configure BACKEND_URL)"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 502 });
}
