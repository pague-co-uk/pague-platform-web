import "server-only";

import { cookies } from "next/headers";

import type {
  AuditLog,
  FindAuditLogsOptions,
} from "./audit-logs-api";

// ============================================================================
// API configuration
// ============================================================================

const CONTROL_PLANE_API_URL =
  process.env.CONTROL_PLANE_API_URL?.replace(
    /\/+$/,
    "",
  );

if (!CONTROL_PLANE_API_URL) {
  throw new Error(
    "CONTROL_PLANE_API_URL is not configured.",
  );
}

// ============================================================================
// API response types
// ============================================================================

interface ApiMeta {
  readonly requestId: string;

  readonly timestamp: string;
}

interface AuditLogResponse {
  readonly success: boolean;

  readonly data: AuditLog;

  readonly meta: ApiMeta;
}

interface PaginatedAuditLogResponse {
  readonly success: boolean;

  readonly data: readonly AuditLog[];

  readonly meta: ApiMeta;

  readonly pagination: {
    readonly page: number;

    readonly pageSize: number;

    readonly totalItems: number;

    readonly totalPages: number;
  };
}

// ============================================================================
// Server result
// ============================================================================

export interface PaginatedAuditLogResult {
  readonly data: readonly AuditLog[];

  readonly pagination: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}

// ============================================================================
// Request options
// ============================================================================

interface RequestOptions {
  readonly method?: string;

  readonly body?: unknown;
}

// ============================================================================
// Request
// ============================================================================

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({ name, value }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${CONTROL_PLANE_API_URL}/api${path}`,
      {
        method:
          options.method ?? "GET",

        headers: {
          Accept:
            "application/json",

          ...(cookieHeader
            ? {
              Cookie:
                cookieHeader,
            }
            : {}),

          ...(options.body !==
            undefined
            ? {
              "Content-Type":
                "application/json",
            }
            : {}),
        },

        body:
          options.body !==
            undefined
            ? JSON.stringify(
              options.body,
            )
            : undefined,

        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      `Control Plane API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const body =
    (await response
      .json()) as T;

  return body;
}
// ============================================================================
// Search parameters
// ============================================================================

function toSearchParams(
  input: FindAuditLogsOptions = {},
): string {
  const params =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Pagination
  // --------------------------------------------------------------------------

  if (
    input.page !==
    undefined
  ) {
    params.set(
      "page",
      String(input.page),
    );
  }

  if (
    input.pageSize !==
    undefined
  ) {
    params.set(
      "pageSize",
      String(input.pageSize),
    );
  }

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  if (
    input.search?.trim()
  ) {
    params.set(
      "search",
      input.search.trim(),
    );
  }

  // --------------------------------------------------------------------------
  // Filters
  // --------------------------------------------------------------------------

  if (
    input.clientId?.trim()
  ) {
    params.set(
      "clientId",
      input.clientId.trim(),
    );
  }

  if (
    input.userId?.trim()
  ) {
    params.set(
      "userId",
      input.userId.trim(),
    );
  }

  if (
    input.action?.trim()
  ) {
    params.set(
      "action",
      input.action.trim(),
    );
  }

  if (
    input.entityType?.trim()
  ) {
    params.set(
      "entityType",
      input.entityType.trim(),
    );
  }

  if (
    input.entityId?.trim()
  ) {
    params.set(
      "entityId",
      input.entityId.trim(),
    );
  }

  const query =
    params.toString();

  return query
    ? `?${query}`
    : "";
}

// ============================================================================
// Normalize paginated response
// ============================================================================

// ============================================================================
// Response validation
// ============================================================================

function assertSuccess(success: boolean): void {
  if (!success) {
    throw new Error(
      "Control Plane API returned an unsuccessful response.",
    );
  }
}


function normalizePaginatedResponse(
  body: PaginatedAuditLogResponse,
): PaginatedAuditLogResult {
  assertSuccess(body.success);

  return {
    data: body.data,

    pagination: {
      page: Number(body.pagination.page),
      pageSize: Number(body.pagination.pageSize),
      total: Number(body.pagination.totalItems),
      totalPages: Number(body.pagination.totalPages),
    },
  };
}

// ============================================================================
// Find audit logs
// ============================================================================

export async function findAuditLogs(
  input: FindAuditLogsOptions = {},
): Promise<PaginatedAuditLogResult> {
  const body =
    await request<PaginatedAuditLogResponse>(
      `/audit-logs${toSearchParams(
        input,
      )}`,
    );

  const result =
    normalizePaginatedResponse(
      body,
    );

  return result;
}

// ============================================================================
// Find audit logs by client
// ============================================================================

export async function findAuditLogsByClient(
  clientId: string,
  input: {
    readonly page?: number;

    readonly pageSize?: number;
  } = {},
): Promise<PaginatedAuditLogResult> {
  const body =
    await request<PaginatedAuditLogResponse>(
      `/audit-logs/client/${encodeURIComponent(
        clientId,
      )}${toSearchParams(
        input,
      )}`,
    );

  return normalizePaginatedResponse(
    body,
  );
}

// ============================================================================
// Find audit logs by entity
// ============================================================================

export async function findAuditLogsByEntity(
  entityType: string,
  entityId: string,
  input: {
    readonly page?: number;

    readonly pageSize?: number;
  } = {},
): Promise<PaginatedAuditLogResult> {
  const body =
    await request<PaginatedAuditLogResponse>(
      `/audit-logs/entity/${encodeURIComponent(
        entityType,
      )}/${encodeURIComponent(
        entityId,
      )}${toSearchParams(
        input,
      )}`,
    );

  return normalizePaginatedResponse(
    body,
  );
}

// ============================================================================
// Find audit logs by user
// ============================================================================

export async function findAuditLogsByUser(
  userId: string,
  input: {
    readonly page?: number;

    readonly pageSize?: number;
  } = {},
): Promise<PaginatedAuditLogResult> {
  const body =
    await request<PaginatedAuditLogResponse>(
      `/audit-logs/user/${encodeURIComponent(
        userId,
      )}${toSearchParams(
        input,
      )}`,
    );

  return normalizePaginatedResponse(
    body,
  );
}

// ============================================================================
// Find audit logs by action
// ============================================================================

export async function findAuditLogsByAction(
  action: string,
  input: {
    readonly page?: number;

    readonly pageSize?: number;
  } = {},
): Promise<PaginatedAuditLogResult> {
  const body =
    await request<PaginatedAuditLogResponse>(
      `/audit-logs/action/${encodeURIComponent(
        action,
      )}${toSearchParams(
        input,
      )}`,
    );

  return normalizePaginatedResponse(
    body,
  );
}

// ============================================================================
// Find audit log by ID
// ============================================================================

export async function findAuditLog(
  id: string,
): Promise<AuditLog | null> {
  try {
    const body =
      await request<AuditLogResponse>(
        `/audit-logs/${encodeURIComponent(
          id,
        )}`,
      );

    assertSuccess(
      body.success,
    );

    return body.data ?? null;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "404",
      )
    ) {
      return null;
    }

    throw error;
  }
}