/**
 * Internal Service Token Minter
 *
 * Creates short-lived JWTs for Next.js → FastAPI internal API calls.
 * Replaces the old static INTERNAL_SERVICE_KEY approach with scoped,
 * time-limited tokens that carry real user/org context.
 *
 * Usage in API routes:
 *   const serviceToken = await createServiceToken(userJwt);
 *   fetch(BACKEND + "/scan", { headers: { Authorization: `Bearer ${serviceToken}` } });
 */

import { SignJWT, jwtVerify } from "jose";

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || "";
const SERVICE_TOKEN_MAX_AGE = 60; // seconds — must match backend SERVICE_TOKEN_MAX_AGE_SECONDS

/**
 * Decode a user JWT payload WITHOUT verification (we just need the claims).
 * The user JWT was already verified during login; here we extract user/org
 * context to embed in the short-lived service token.
 */
function decodeUserJwt(token: string): { sub: string; org: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return {
      sub: payload.sub || "",
      org: payload.org || "",
      role: payload.role || "member",
    };
  } catch {
    return null;
  }
}

/**
 * Create a short-lived service JWT scoped to a specific user/org.
 *
 * The token:
 * - Is signed with INTERNAL_SERVICE_KEY (shared secret with FastAPI)
 * - Carries real user identity (sub, org, role) from the user's session JWT
 * - Expires in 60 seconds (FastAPI enforces this + IP allowlisting)
 * - Has iss=sageai-frontend, aud=sageai-api-internal
 *
 * @param userJwt - The user's session JWT from the sageai_jwt cookie
 * @returns The signed service token, or null if unable to create
 */
export async function createServiceToken(userJwt: string): Promise<string | null> {
  if (!INTERNAL_SERVICE_KEY) {
    // Service key not configured — fall back to passing user JWT directly
    return null;
  }

  const claims = decodeUserJwt(userJwt);
  if (!claims || !claims.sub || !claims.org) {
    return null;
  }

  const secret = new TextEncoder().encode(INTERNAL_SERVICE_KEY);

  const token = await new SignJWT({
    sub: claims.sub,
    org: claims.org,
    role: claims.role,
    type: "service",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SERVICE_TOKEN_MAX_AGE}s`)
    .setIssuer("sageai-frontend")
    .setAudience("sageai-api-internal")
    .sign(secret);

  return token;
}

/**
 * Get the best auth token for calling the FastAPI backend.
 *
 * Tries to mint a scoped service token first. If INTERNAL_SERVICE_KEY
 * is not configured, falls back to passing the user JWT directly
 * (which still works — the backend validates both flows).
 *
 * @param userJwt - The user's session JWT from the sageai_jwt cookie
 * @returns The token to use in the Authorization header
 */
export async function getBackendAuthToken(userJwt: string): Promise<string> {
  const serviceToken = await createServiceToken(userJwt);
  return serviceToken || userJwt;
}
