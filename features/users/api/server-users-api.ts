import "server-only";

import { cookies } from "next/headers";

import type {
  User,
  UserSummary,
} from "../types/user";

// ============================================================================
// Types
// ============================================================================

export interface FindUsersParams {
  readonly search?: string;

  readonly status?: string;

  readonly page?: number;

  readonly pageSize?: number;

  readonly sortBy?: string;

  readonly sortDirection?:
  | "asc"
  | "desc";
}

export interface FindUsersResult {
  readonly items: readonly UserSummary[];

  readonly meta: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}

// ============================================================================
// Error
// ============================================================================

export class ServerUsersApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ServerUsersApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
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
    throw new ServerUsersApiError(
      "Authentication required.",
      401,
    );
  }

  return `${session.name}=${session.value}`;
}

// ============================================================================
// Find users
//
// Server-side only.
// ============================================================================

export async function findUsers(
  params: FindUsersParams = {},
): Promise<FindUsersResult> {
  const session =
    await getSessionCookie();

  const searchParams =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  if (
    params.search
  ) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  // --------------------------------------------------------------------------
  // Status
  // --------------------------------------------------------------------------

  if (
    params.status
  ) {
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
      params.pageSize ?? 100,
    ),
  );

  // --------------------------------------------------------------------------
  // Sorting
  // --------------------------------------------------------------------------

  if (
    params.sortBy
  ) {
    searchParams.set(
      "sortBy",
      params.sortBy,
    );
  }

  if (
    params.sortDirection
  ) {
    searchParams.set(
      "sortDirection",
      params.sortDirection,
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users?${searchParams.toString()}`,
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
      "[Users] Failed to connect to Control Plane.",
      error,
    );

    throw new ServerUsersApiError(
      "Unable to connect to the user service.",
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
    throw new ServerUsersApiError(
      getErrorMessage(
        body,
        "Unable to load users.",
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
    throw new ServerUsersApiError(
      "Invalid users response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new ServerUsersApiError(
      "Invalid users response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    !Array.isArray(
      body.data,
    )
  ) {
    throw new ServerUsersApiError(
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
    throw new ServerUsersApiError(
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
    throw new ServerUsersApiError(
      "Invalid users pagination response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Normalize response
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
// Find user by ID
// ============================================================================

export async function findUserById(
  id: string,
): Promise<User | null> {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const session =
    await getSessionCookie();

  // ==========================================================================
  // Request
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users/${encodeURIComponent(
          id,
        )}`,
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
      "[Users] Failed to connect to Control Plane.",
      error,
    );

    throw new ServerUsersApiError(
      "Unable to connect to the user service.",
      502,
    );
  }

  // ==========================================================================
  // Parse response
  // ==========================================================================

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

  // ==========================================================================
  // Not found
  // ==========================================================================

  if (
    response.status ===
    404
  ) {
    return null;
  }

  // ==========================================================================
  // Authentication failure
  // ==========================================================================

  if (
    response.status ===
    401
  ) {
    throw new ServerUsersApiError(
      getErrorMessage(
        body,
        "Authentication required.",
      ),
      401,
    );
  }

  // ==========================================================================
  // Other API errors
  // ==========================================================================

  if (!response.ok) {
    throw new ServerUsersApiError(
      getErrorMessage(
        body,
        "Unable to load user.",
      ),
      response.status,
    );
  }

  // ==========================================================================
  // Validate response envelope
  // ==========================================================================

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  // ==========================================================================
  // Return user
  // ==========================================================================

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

  // --------------------------------------------------------------------------
  // Standard API error
  // --------------------------------------------------------------------------

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