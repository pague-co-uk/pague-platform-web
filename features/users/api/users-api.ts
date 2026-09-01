import type {
  PaginatedUsersResponse,
  User,
  UserSummary,
} from "../types/user";

// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

// ============================================================================
// Error
// ============================================================================

export class UsersApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "UsersApiError";

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

interface ApiCollectionResponse<T> {
  success: true;

  data: readonly T[];

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  meta: ApiMeta;
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

  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    console.error(
      "[Users API] Request failed.",
      {
        status: response.status,
        statusText: response.statusText,
        body,
      },
    );

    throw new UsersApiError(
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
// Find users
// ============================================================================

export interface FindUsersParams {
  search?: string;

  status?: string;

  page?: number;

  pageSize?: number;

  sortBy?: string;

  sortDirection?:
  | "asc"
  | "desc";
}

export async function findUsers(
  params: FindUsersParams = {},
): Promise<PaginatedUsersResponse> {
  const searchParams =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  // --------------------------------------------------------------------------
  // Status
  // --------------------------------------------------------------------------

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  // --------------------------------------------------------------------------
  // Pagination
  // --------------------------------------------------------------------------

  searchParams.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  searchParams.set(
    "pageSize",
    String(
      params.pageSize ?? 20,
    ),
  );

  // --------------------------------------------------------------------------
  // Sorting
  // --------------------------------------------------------------------------

  if (params.sortBy) {
    searchParams.set(
      "sortBy",
      params.sortBy,
    );
  }

  if (params.sortDirection) {
    searchParams.set(
      "sortDirection",
      params.sortDirection,
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  const response =
    await fetch(
      `${API_BASE}/users?${searchParams.toString()}`,
      {
        method: "GET",

        credentials:
          "include",

        cache: "no-store",
      },
    );

  const body =
    await handleResponse(
      response,
    );

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new UsersApiError(
      "Invalid response from the users service.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new UsersApiError(
      "Invalid response from the users service.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    !Array.isArray(
      body.data,
    )
  ) {
    throw new UsersApiError(
      "Invalid users collection response.",
      response.status,
    );
  }

  if (
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new UsersApiError(
      "Invalid users pagination response.",
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
    throw new UsersApiError(
      "Invalid users pagination response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Normalize API response
  // --------------------------------------------------------------------------

  return {
    items:
      body.data as UserSummary[],

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
// Find user
// ============================================================================

export async function findUserById(
  id: string,
): Promise<User> {
  const response =
    await fetch(
      `/api/users/${encodeURIComponent(id)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  if (!response.ok) {
    throw new UsersApiError(
      getErrorMessage(
        body,
        "Unable to load user.",
      ),
      response.status,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !== "object" ||
    body.data === null
  ) {
    throw new UsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  return body.data as User;
}

// ============================================================================
// Activate user
// ============================================================================

export async function activateUser(
  id: string,
): Promise<User> {
  return mutateUser(
    id,
    "activate",
  );
}

// ============================================================================
// Deactivate user
// ============================================================================

export async function deactivateUser(
  id: string,
): Promise<User> {
  return mutateUser(
    id,
    "deactivate",
  );
}

// ============================================================================
// Unlock user
// ============================================================================

export async function unlockUser(
  id: string,
): Promise<User> {
  return mutateUser(
    id,
    "unlock",
  );
}

// ============================================================================
// User mutation helper
// ============================================================================

async function mutateUser(
  id: string,
  action:
    | "activate"
    | "deactivate"
    | "unlock",
): Promise<User> {
  const response =
    await fetch(
      `${API_BASE}/users/${encodeURIComponent(id)}/${action}`,
      {
        method: "POST",

        credentials:
          "include",

        cache: "no-store",
      },
    );

  const body =
    await handleResponse(
      response,
    );

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new UsersApiError(
      "Invalid response from the users service.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new UsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  return body.data as User;
}

// ============================================================================
// Delete user
// ============================================================================

export async function deleteUser(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `${API_BASE}/users/${encodeURIComponent(id)}`,
      {
        method: "DELETE",

        credentials:
          "include",

        cache: "no-store",
      },
    );

  await handleResponse(
    response,
  );
}

// ============================================================================
// Update user roles
// ============================================================================

export async function updateUserRoles(
  id: string,
  roleIds: readonly string[],
): Promise<User> {
  const response =
    await fetch(
      `${API_BASE}/users/${encodeURIComponent(id)}/roles`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        cache: "no-store",

        body: JSON.stringify({
          roleIds,
        }),
      },
    );

  const body =
    await handleResponse(
      response,
    );

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new UsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  return body.data as User;
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