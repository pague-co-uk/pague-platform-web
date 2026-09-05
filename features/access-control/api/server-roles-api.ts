import "server-only";

import { cookies } from "next/headers";

import type {
  CreateRoleInput,
  FindRolesOptions,
  FindRolesResult,
  Role,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "./roles-api";

const CONTROL_PLANE_API_URL =
  process.env.CONTROL_PLANE_API_URL;

if (!CONTROL_PLANE_API_URL) {
  throw new Error(
    "CONTROL_PLANE_API_URL is not configured.",
  );
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

async function getCookieHeader(): Promise<string> {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");
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
    } else if (
      typeof body.message === "string"
    ) {
      message = body.message;
    } else if (
      typeof body.error === "string"
    ) {
      message = body.error;
    }
  } catch {
    // Keep the default error message.
  }

  throw new Error(message);
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
    throw new Error(
      "Invalid roles API response.",
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
    throw new Error(
      "Invalid paginated roles API response.",
    );
  }
}

async function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookieHeader =
    await getCookieHeader();

  const headers = new Headers(
    init.headers,
  );

  if (cookieHeader) {
    headers.set(
      "Cookie",
      cookieHeader,
    );
  }

  return fetch(
    `${CONTROL_PLANE_API_URL}/api${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
    },
  );
}

export async function findRoles(
  options: FindRolesOptions = {},
): Promise<FindRolesResult> {
  const response = await request(
    `/roles${buildQuery(options)}`,
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
  const response = await request(
    `/roles/${encodeURIComponent(id)}`,
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
  const response = await request(
    "/roles",
    {
      method: "POST",
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
  const response = await request(
    `/roles/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
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
  const response = await request(
    `/roles/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
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
  const response = await request(
    `/roles/${encodeURIComponent(id)}/permissions`,
    {
      method: "PUT",
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