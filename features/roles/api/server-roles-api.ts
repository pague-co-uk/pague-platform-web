import {
  cookies,
} from "next/headers";

import type {
  RoleSummary,
} from "../types/role";

// ============================================================================
// Types
// ============================================================================

export interface FindRolesResult {
  readonly items: readonly RoleSummary[];

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
// Find roles
// ============================================================================

export async function findRoles(
  options: {
    page?: number;

    pageSize?: number;

    search?: string;
  } = {},
): Promise<FindRolesResult> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "session",
    );

  if (!session) {
    throw new RolesApiError(
      "Authentication required.",
      401,
    );
  }

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(
      options.page ?? 1,
    ),
  );

  params.set(
    "pageSize",
    String(
      options.pageSize ?? 100,
    ),
  );

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/roles?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Roles] Failed to connect to Control Plane.",
      error,
    );

    throw new RolesApiError(
      "Unable to connect to the role service.",
      502,
    );
  }

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

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
    !Array.isArray(
      body.data,
    ) ||
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