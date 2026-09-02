// ============================================================================
// Configuration
// ============================================================================

import { NextRequest } from "next/server";

export function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Authentication cookies
// ============================================================================

export function getCookieHeader(
  request: NextRequest,
): string {
  return request.cookies
    .getAll()
    .map(
      ({
        name,
        value,
      }) =>
        `${name}=${value}`,
    )
    .join("; ");
}