// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

// ============================================================================
// Types
// ============================================================================

export type HealthCheckStatus =
  | "up"
  | "down";

export type OverallHealthStatus =
  | "healthy"
  | "degraded";

export interface HealthCheck {
  readonly status: HealthCheckStatus;

  readonly latency: number;

  readonly error?: string;

  readonly details?: Record<
    string,
    HealthCheck
  >;
}

export interface HealthResponse {
  readonly status: OverallHealthStatus;

  readonly service: string;

  readonly version: string;

  readonly environment: string;

  readonly uptime: number;

  readonly timestamp: string;

  readonly checks: Record<
    string,
    HealthCheck
  >;
}

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
// Find platform health
// ============================================================================

export async function findPlatformHealth(): Promise<HealthResponse> {
  const response =
    await fetch(
      `${API_BASE}/health/platform`,
      {
        method: "GET",

        credentials:
          "include",

        cache: "no-store",
      },
    );

  const body =
    await response
      .json()
      .catch(
        () => null,
      ) as unknown;

  if (!response.ok) {
    throw new HealthApiError(
      getHealthErrorMessage(
        body,
        "Unable to load platform health.",
      ),
      response.status,
    );
  }

  if (
    !isHealthResponse(
      body,
    )
  ) {
    throw new HealthApiError(
      "Invalid platform health response.",
      response.status,
    );
  }

  return body;
}

// ============================================================================
// Response validation
// ============================================================================

function isHealthResponse(
  value: unknown,
): value is HealthResponse {
  if (
    typeof value !==
    "object" ||
    value === null
  ) {
    return false;
  }

  if (
    !("status" in value) ||
    (value.status !==
      "healthy" &&
      value.status !==
      "degraded")
  ) {
    return false;
  }

  if (
    !("service" in value) ||
    typeof value.service !==
    "string"
  ) {
    return false;
  }

  if (
    !("version" in value) ||
    typeof value.version !==
    "string"
  ) {
    return false;
  }

  if (
    !("environment" in value) ||
    typeof value.environment !==
    "string"
  ) {
    return false;
  }

  if (
    !("uptime" in value) ||
    typeof value.uptime !==
    "number"
  ) {
    return false;
  }

  if (
    !("timestamp" in value) ||
    typeof value.timestamp !==
    "string"
  ) {
    return false;
  }

  if (
    !("checks" in value) ||
    typeof value.checks !==
    "object" ||
    value.checks === null
  ) {
    return false;
  }

  return true;
}

// ============================================================================
// Error extraction
// ============================================================================

function getHealthErrorMessage(
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
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message ===
    "string" &&
    data.error.message.trim()
  ) {
    return data.error.message;
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