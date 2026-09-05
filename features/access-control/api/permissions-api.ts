export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
}

export interface PermissionMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindPermissionsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  module?: string;
}

export interface FindPermissionsResult {
  items: readonly Permission[];
  meta: PermissionMeta;
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

class PermissionsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PermissionsApiError";
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
    // Keep default error.
  }

  throw new PermissionsApiError(
    message,
    response.status,
  );
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
    throw new PermissionsApiError(
      "Invalid permissions API response.",
      500,
    );
  }
}

function buildQuery(
  options: FindPermissionsOptions = {},
): string {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.set("page", String(options.page));
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

  if (options.module?.trim()) {
    params.set(
      "module",
      options.module.trim(),
    );
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function findPermissions(
  options: FindPermissionsOptions = {},
): Promise<FindPermissionsResult> {
  const response = await fetch(
    `/api/permissions${buildQuery(options)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await parseError(response);
  }

  const body: unknown = await response.json();

  assertPaginated<Permission>(body);

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