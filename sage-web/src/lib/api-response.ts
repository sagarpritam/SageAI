import { NextResponse } from "next/server";

export interface ApiErrorPayload {
  error: string;
  code: number;
  details?: unknown;
}

/**
 * Standardized API error response helper for Next.js App Router routes.
 */
export function apiError(
  message: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse<ApiErrorPayload> {
  const isProd = process.env.NODE_ENV === "production";
  const safeMessage =
    statusCode >= 500 && isProd ? "Internal server error" : message;

  return NextResponse.json(
    {
      error: safeMessage,
      code: statusCode,
      ...(details && !isProd ? { details } : {}),
    },
    { status: statusCode }
  );
}

/**
 * Catch-all handler for unknown route errors.
 */
export function handleRouteError(err: unknown): NextResponse<ApiErrorPayload> {
  const message = err instanceof Error ? err.message : "Internal server error";
  return apiError(message, 500);
}
