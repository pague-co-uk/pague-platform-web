import type {
  RoleSummary,
} from "../types/role";

// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

// ============================================================================
// Error
// ============================================================================

export class RolesApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "RolesApiError";

    this.status =
      status;
  }
}

// ============================================================================
// API response types
// ============================================================================

interface ApiMeta {
  readonly requestId: string;

  readonly timestamp: string;
}

interface ApiCollectionResponse<T> {
  readonly success: true;

  readonly data: readonly T[];

  readonly pagination: {
    readonly page: number;

    readonly pageSize: number;

    readonly totalItems: number;

    readonly totalPages: number;

    readonly hasNext: boolean;

    readonly hasPrevious: boolean;
  };

  readonly meta: ApiMeta;
}

// ============================================================================
// Find roles
// ============================================================================

export interface FindRolesParams {
  readonly page?: number;

  readonly pageSize?: number;

  readonly search?: string;
}

export interface FindRolesResult {
  readonly items: readonly RoleSummary[];

  readonly meta: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}

export async function findRoles(
  params: FindRolesParams = {},
): Promise<FindRolesResult> {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  searchParams.set(
    "pageSize",
    String(
      params.pageSize ?? 100,
    ),
  );

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  const response =
    await fetch(
      `${API_BASE}/roles?${searchParams.toString()}`,
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
    throw new RolesApiError(
      getRoleErrorMessage(
        body,
        "Unable to load roles.",
      ),
      response.status,
    );
  }

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    !Array.isArray(body.data) ||
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new RolesApiError(
      "Invalid roles response.",
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
    throw new RolesApiError(
      "Invalid roles pagination response.",
      response.status,
    );
  }

  return {
    items:
      body.data as RoleSummary[],

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
// Error extraction
// ============================================================================

function getRoleErrorMessage(
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