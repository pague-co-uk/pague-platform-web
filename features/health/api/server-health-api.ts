import { cookies } from "next/headers";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

import type {
  HealthCheck,
  HealthResponse,
} from "./health-api";

// ============================================================================
// Error
// ============================================================================

export class HealthApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "HealthApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Validation
// ============================================================================

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
    "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isHealthCheck(
  value: unknown,
): value is HealthCheck {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (
      value.status ===
      "up" ||
      value.status ===
      "down"
    ) &&
    typeof value.latency ===
    "number"
  );
}

function isHealthResponse(
  value: unknown,
): value is HealthResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.status !==
    "healthy" &&
    value.status !==
    "degraded"
  ) {
    return false;
  }

  if (
    typeof value.service !==
    "string"
  ) {
    return false;
  }

  if (
    typeof value.version !==
    "string"
  ) {
    return false;
  }

  if (
    typeof value.environment !==
    "string"
  ) {
    return false;
  }

  if (
    typeof value.uptime !==
    "number"
  ) {
    return false;
  }

  if (
    typeof value.timestamp !==
    "string"
  ) {
    return false;
  }

  if (
    !isRecord(
      value.checks,
    )
  ) {
    return false;
  }

  for (
    const check of Object.values(
      value.checks,
    )
  ) {
    if (
      !isHealthCheck(
        check,
      )
    ) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Find Platform Health
// ============================================================================

export async function findPlatformHealth(): Promise<HealthResponse> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/health/platform`,
      {
        method: "GET",

        headers: {
          Cookie:
            cookieHeader,
        },

        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: HealthResponse;

        message?: string;

        error?: string;
      } | null;

  // ==========================================================================
  // Error
  // ==========================================================================

  if (!response.ok) {
    throw new HealthApiError(
      body?.message ??
      body?.error ??
      `Unable to retrieve platform health (${response.status}).`,
      response.status,
    );
  }

  // ==========================================================================
  // Response
  // ==========================================================================

  if (
    !body?.success ||
    !isHealthResponse(
      body.data,
    )
  ) {
    throw new HealthApiError(
      "Invalid platform health response.",
      response.status,
    );
  }

  return body.data;
}