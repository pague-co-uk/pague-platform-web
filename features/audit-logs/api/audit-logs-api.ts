// ============================================================================
// Types
// ============================================================================

export interface AuditLog {
  readonly id: string;

  readonly clientId: string | null;

  readonly userId: string | null;

  readonly entityType: string;

  readonly entityId: string;

  readonly action: string;

  readonly oldValues: unknown | null;

  readonly newValues: unknown | null;

  readonly ipAddress: string | null;

  readonly userAgent: string | null;

  readonly createdAt: string;
}

// ============================================================================
// Audit log pagination
// ============================================================================

export interface AuditLogMeta {
  readonly page: number;

  readonly pageSize: number;

  readonly total: number;

  readonly totalPages: number;
}

// ============================================================================
// Find audit logs result
// ============================================================================

export interface FindAuditLogsResult {
  readonly items: readonly AuditLog[];

  readonly meta: AuditLogMeta;
}

// ============================================================================
// Find audit logs options
// ============================================================================

export interface FindAuditLogsOptions {
  readonly page?: number;

  readonly pageSize?: number;

  readonly search?: string;

  readonly clientId?: string;

  readonly userId?: string;

  readonly action?: string;

  readonly entityType?: string;

  readonly entityId?: string;
}

// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

/**
 * Returns the base URL used to access the Next.js API.
 *
 * Browser:
 *   /api
 *
 * Server:
 *   http://localhost:3001/api
 *
 * The Control Plane URL is intentionally NOT used here.
 * The Next.js API routes are the frontend's proxy layer and are
 * responsible for forwarding requests to the Control Plane.
 */
function getApiBaseUrl(): string {
  if (
    typeof window !==
    "undefined"
  ) {
    return API_BASE;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  return `${appUrl.replace(
    /\/+$/,
    "",
  )}${API_BASE}`;
}

// ============================================================================
// Error
// ============================================================================

export class AuditLogsApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "AuditLogsApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Find audit logs
// ============================================================================

export async function findAuditLogs(
  options: FindAuditLogsOptions = {},
): Promise<FindAuditLogsResult> {
  const params =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Pagination
  // --------------------------------------------------------------------------

  params.set(
    "page",
    String(
      options.page ?? 1,
    ),
  );

  params.set(
    "pageSize",
    String(
      options.pageSize ?? 20,
    ),
  );

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  if (
    options.search?.trim()
  ) {
    params.set(
      "search",
      options.search.trim(),
    );
  }

  // --------------------------------------------------------------------------
  // Filters
  // --------------------------------------------------------------------------

  if (
    options.clientId?.trim()
  ) {
    params.set(
      "clientId",
      options.clientId.trim(),
    );
  }

  if (
    options.userId?.trim()
  ) {
    params.set(
      "userId",
      options.userId.trim(),
    );
  }

  if (
    options.action?.trim()
  ) {
    params.set(
      "action",
      options.action.trim(),
    );
  }

  if (
    options.entityType?.trim()
  ) {
    params.set(
      "entityType",
      options.entityType.trim(),
    );
  }

  if (
    options.entityId?.trim()
  ) {
    params.set(
      "entityId",
      options.entityId.trim(),
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  const response =
    await fetch(
      `${getApiBaseUrl()}/audit-logs?${params.toString()}`,
      {
        method: "GET",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new AuditLogsApiError(
      getAuditLogsErrorMessage(
        body,
        "Unable to load audit logs.",
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
    throw new AuditLogsApiError(
      "Invalid audit logs response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new AuditLogsApiError(
      "Invalid audit logs response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    !Array.isArray(
      body.data,
    )
  ) {
    throw new AuditLogsApiError(
      "Invalid audit logs collection response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate pagination
  // --------------------------------------------------------------------------

  if (
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new AuditLogsApiError(
      "Invalid audit logs pagination response.",
      response.status,
    );
  }

  const pagination =
    body.pagination;

  if (
    !("page" in pagination) ||
    !("pageSize" in pagination) ||
    !("totalItems" in pagination) ||
    !("totalPages" in pagination)
  ) {
    throw new AuditLogsApiError(
      "Invalid audit logs pagination response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Normalize response
  // --------------------------------------------------------------------------

  return {
    items:
      body.data as AuditLog[],

    meta: {
      page:
        Number(
          pagination.page,
        ),

      pageSize:
        Number(
          pagination.pageSize,
        ),

      total:
        Number(
          pagination.totalItems,
        ),

      totalPages:
        Number(
          pagination.totalPages,
        ),
    },
  };
}

// ============================================================================
// Find audit log by ID
// ============================================================================

export async function findAuditLogById(
  id: string,
): Promise<AuditLog> {
  const response =
    await fetch(
      `${getApiBaseUrl()}/audit-logs/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new AuditLogsApiError(
      getAuditLogsErrorMessage(
        body,
        "Unable to load audit log.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new AuditLogsApiError(
      "Invalid audit log response.",
      response.status,
    );
  }

  return body.data as AuditLog;
}

// ============================================================================
// Error extraction
// ============================================================================

function getAuditLogsErrorMessage(
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

  // --------------------------------------------------------------------------
  // Standard API error envelope
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Direct message
  // --------------------------------------------------------------------------

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