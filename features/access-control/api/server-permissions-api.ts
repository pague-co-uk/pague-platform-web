import "server-only";

import { cookies } from "next/headers";

import { getControlPlaneUrl } from "@/lib/control-plane";
import type {
  FindPermissionsOptions,
  FindPermissionsResult,
  Permission,
} from "./permissions-api";


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

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");
}

async function request(
  path: string,
): Promise<Response> {
  const cookieHeader =
    await getCookieHeader();

  const headers = new Headers();

  if (cookieHeader) {
    headers.set(
      "Cookie",
      cookieHeader,
    );
  }

  return fetch(
    `${getControlPlaneUrl()}/api${path}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );
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

  throw new Error(message);
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
      "Invalid paginated permissions API response.",
    );
  }
}

export async function findPermissions(
  options: FindPermissionsOptions = {},
): Promise<FindPermissionsResult> {
  const response = await request(
    `/permissions${buildQuery(options)}`,
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