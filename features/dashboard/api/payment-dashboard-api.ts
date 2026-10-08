

// ============================================================================
// API configuration
// ============================================================================

import { PaymentDashboardData, PaymentDashboardPeriodValue } from "../types/payment-dashboard";

const API_BASE =
  "/api";

// ============================================================================
// Error
// ============================================================================

export class PaymentDashboardApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "PaymentDashboardApiError";

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
      "[Payment Dashboard API] Request failed.",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        body,
      },
    );

    throw new PaymentDashboardApiError(
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
// Get payment dashboard
// ============================================================================

export interface GetPaymentDashboardParams {
  readonly period?:
  PaymentDashboardPeriodValue;
}

export async function getPaymentDashboard(
  params: GetPaymentDashboardParams = {},
): Promise<PaymentDashboardData> {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "period",
    params.period ??
    "30d",
  );

  const response =
    await fetch(
      `${API_BASE}/dashboard/payments?${searchParams.toString()}`,
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
    throw new PaymentDashboardApiError(
      "Invalid payment dashboard response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new PaymentDashboardApiError(
      "Invalid payment dashboard response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new PaymentDashboardApiError(
      "Invalid payment dashboard data response.",
      response.status,
    );
  }

  return body.data as PaymentDashboardData;
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