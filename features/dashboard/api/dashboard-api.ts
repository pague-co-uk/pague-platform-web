import type {
  DashboardData,
  DashboardPeriodValue,
} from "../types/dashboard";

// ============================================================================
// API configuration
// ============================================================================

const API_BASE =
  "/api";

// ============================================================================
// Error
// ============================================================================

export class DashboardApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "DashboardApiError";

    this.status =
      status;
  }
}

// ============================================================================
// API response types
// ============================================================================

interface ApiMeta {
  requestId: string;

  timestamp: string;
}

interface ApiSuccessResponse<T> {
  success: true;

  data: T;

  meta: ApiMeta;
}

// ============================================================================
// Response handling
// ============================================================================

async function handleResponse(
  response: Response,
): Promise<unknown> {
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

  if (!response.ok) {
    console.error(
      "[Dashboard API] Request failed.",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        body,
      },
    );

    throw new DashboardApiError(
      getErrorMessage(
        body,
        `Unable to complete the request. HTTP ${response.status}.`,
      ),
      response.status,
    );
  }

  return body;
}

// ============================================================================
// Get dashboard
// ============================================================================

export interface GetDashboardParams {
  readonly period?:
  DashboardPeriodValue;
}

export async function getDashboard(
  params: GetDashboardParams = {},
): Promise<DashboardData> {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "period",
    params.period ??
    "30d",
  );

  const response =
    await fetch(
      `${API_BASE}/dashboard?${searchParams.toString()}`,
      {
        method: "GET",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const body =
    await handleResponse(
      response,
    );

  // --------------------------------------------------------------------------
  // Validate response envelope
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new DashboardApiError(
      "Invalid dashboard response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new DashboardApiError(
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
    throw new DashboardApiError(
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