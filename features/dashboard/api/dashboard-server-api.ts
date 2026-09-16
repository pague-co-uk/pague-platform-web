import "server-only";

import {
  cookies,
} from "next/headers";

import type {
  DashboardData,
} from "../types/dashboard";

// ============================================================================
// Error
// ============================================================================

export class ServerDashboardApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ServerDashboardApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
  const value =
    process.env
      .CONTROL_PLANE_API_URL;

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
// Authentication
// ============================================================================

async function getSessionCookie(): Promise<string> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "session",
    );

  if (!session?.value) {
    throw new ServerDashboardApiError(
      "Authentication required.",
      401,
    );
  }

  return `${session.name}=${session.value}`;
}

// ============================================================================
// Period
// ============================================================================

export type DashboardPeriod =
  | "7d"
  | "30d"
  | "90d";

// ============================================================================
// Get dashboard
// ============================================================================

export async function getDashboard(
  period:
    DashboardPeriod = "30d",
): Promise<DashboardData> {
  const session =
    await getSessionCookie();

  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "period",
    period,
  );

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/dashboard?${searchParams.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              session,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Dashboard] Failed to connect to Control Plane.",
      error,
    );

    throw new ServerDashboardApiError(
      "Unable to connect to the dashboard service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Parse response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown =
    null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API errors
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ServerDashboardApiError(
      getErrorMessage(
        body,
        "Unable to load dashboard.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response envelope
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new ServerDashboardApiError(
      "Invalid dashboard response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new ServerDashboardApiError(
      "Invalid dashboard response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new ServerDashboardApiError(
      "Invalid dashboard data response.",
      response.status,
    );
  }

  return body.data as DashboardData;
}

// ============================================================================
// Error extraction
// ============================================================================

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !==
    "object" ||
    data === null
  ) {
    return fallback;
  }

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null
  ) {
    const error =
      data.error;

    if (
      "message" in error &&
      typeof error.message ===
      "string" &&
      error.message.trim()
    ) {
      return error.message;
    }
  }

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}