export interface RolePermission {
  id: string;
  name: string;
  description: string | null;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: readonly RolePermission[];
}

export interface RoleMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindRolesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface FindRolesResult {
  items: readonly Role[];
  meta: RoleMeta;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface UpdateRolePermissionsInput {
  permissionIds: readonly string[];
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiPaginatedResponse<T> {
  success: true;
  data: readonly T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

class RolesApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "RolesApiError";
    this.status = status;
  }
}

async function parseError(
  response: Response,
): Promise<never> {
  let message =
    `Request failed with status ${response.status}.`;

  try {
    const body = (await response.json()) as {
      message?: string | readonly string[];
      error?: string;
    };

    if (Array.isArray(body.message)) {
      message = body.message.join(", ");
    } else if (typeof body.message === "string") {
      message = body.message;
    } else if (typeof body.error === "string") {
      message = body.error;
    }
  } catch {
    // Keep the default error message.
  }

  throw new RolesApiError(
    message,
    response.status,
  );
}

function assertSuccess<T>(
  value: unknown,
): asserts value is ApiSuccessResponse<T> {
  if (
    typeof value !== "object" ||
    value === null ||
    !("success" in value) ||
    value.success !== true ||
    !("data" in value)
  ) {
    throw new RolesApiError(
      "Invalid roles API response.",
      500,
    );
  }
}

function assertPaginated<T>(
  value: unknown,
): asserts value is ApiPaginatedResponse<T> {
  if (
    typeof value !== "object" ||
    value === null ||
    !("success" in value) ||
    value.success !== true ||
    !("data" in value) ||
    !Array.isArray(value.data) ||
    !("pagination" in value) ||
    typeof value.pagination !== "object" ||
    value.pagination === null
  ) {
    throw new RolesApiError(
      "Invalid paginated roles API response.",
      500,
    );
  }
}

function buildQuery(
  options: FindRolesOptions = {},
): string {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.set(
      "page",
      String(options.page),
    );
  }

  if (options.pageSize !== undefined) {
    params.set(
      "pageSize",
      String(options.pageSize),
    );
  }

  if (options.search?.trim()) {
    params.set(
      "search",
      options.search.trim(),
    );
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function findRoles(
  options: FindRolesOptions = {},
): Promise<FindRolesResult> {
  const response = await fetch(
    `/api/roles${buildQuery(options)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown =
    await response.json();

  assertPaginated<Role>(body);

  return {
    items: body.data,
    meta: {
      page: body.pagination.page,
      pageSize: body.pagination.pageSize,
      total: body.pagination.totalItems,
      totalPages: body.pagination.totalPages,
    },
  };
}

export async function findRoleById(
  id: string,
): Promise<Role> {
  const response = await fetch(
    `/api/roles/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown =
    await response.json();

  assertSuccess<Role>(body);

  return body.data;
}

export async function createRole(
  input: CreateRoleInput,
): Promise<Role> {
  const response = await fetch(
    "/api/roles",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown =
    await response.json();

  assertSuccess<Role>(body);

  return body.data;
}

export async function updateRole(
  id: string,
  input: UpdateRoleInput,
): Promise<Role> {
  const response = await fetch(
    `/api/roles/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown =
    await response.json();

  assertSuccess<Role>(body);

  return body.data;
}

export async function deleteRole(
  id: string,
): Promise<void> {
  const response = await fetch(
    `/api/roles/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await parseError(response);
  }
}

export async function updateRolePermissions(
  id: string,
  input: UpdateRolePermissionsInput,
): Promise<Role> {
  const response = await fetch(
    `/api/roles/${encodeURIComponent(id)}/permissions`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown =
    await response.json();

  assertSuccess<Role>(body);

  return body.data;
}