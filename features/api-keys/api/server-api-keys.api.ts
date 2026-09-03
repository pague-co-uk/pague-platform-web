import "server-only";

import { cookies } from "next/headers";

import type {
  ApiKey,
  ApiKeyCreatedResponse,
  ApiKeyPagination,
} from "./api-keys-api";

type ApiKeyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";

interface PaginatedApiKeyResult {
  data: ApiKey[];
  pagination: ApiKeyPagination;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const getApiUrl = (): string => {
  const value =
    process.env.CONTROL_PLANE_API_URL?.trim();

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(/\/+$/, "");
};

const getCookieHeader =
  async (): Promise<string> => {
    const cookieStore = await cookies();

    return cookieStore
      .getAll()
      .map(
        ({ name, value }) =>
          `${name}=${value}`,
      )
      .join("; ");
  };

const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(
    `${getApiUrl()}${path}`,
    {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        cookie:
          await getCookieHeader(),
      },
      cache: "no-store",
    },
  );

  const body =
    await response.text();

  if (!response.ok) {
    throw new Error(
      body ||
      `Control Plane request failed with status ${response.status}.`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!body) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
};

const extractData = <T>(
  response: ApiResponse<T>,
): T => {
  if (!response.success) {
    throw new Error(
      "Control Plane API request was not successful.",
    );
  }

  return response.data;
};

const extractPaginatedData = <T>(
  response: {
    success: boolean;
    data: T[];
    pagination: ApiKeyPagination;
  },
): {
  data: T[];
  pagination: ApiKeyPagination;
} => {
  if (!response.success) {
    throw new Error(
      "Control Plane API request was not successful.",
    );
  }

  return {
    data: Array.isArray(response.data)
      ? response.data
      : [],
    pagination:
      response.pagination,
  };
};

export async function findApiKeys(
  clientId: string,
  options?: {
    page?: number;
    pageSize?: number;
    status?: ApiKeyStatus;
  },
): Promise<PaginatedApiKeyResult> {
  const params =
    new URLSearchParams();

  if (options?.page !== undefined) {
    params.set(
      "page",
      String(options.page),
    );
  }

  if (
    options?.pageSize !== undefined
  ) {
    params.set(
      "pageSize",
      String(options.pageSize),
    );
  }

  if (options?.status !== undefined) {
    params.set(
      "status",
      options.status,
    );
  }

  const query =
    params.toString();

  const response =
    await request<{
      success: boolean;
      data: ApiKey[];
      pagination: ApiKeyPagination;
    }>(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys${query ? `?${query}` : ""
      }`,
    );

  return extractPaginatedData(
    response,
  );
}

export async function createApiKey(
  clientId: string,
  input: {
    name: string;
    capabilities: readonly string[];
    expiresAt?: string;
  },
): Promise<ApiKeyCreatedResponse> {
  const response =
    await request<
      ApiResponse<ApiKeyCreatedResponse>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys`,
      {
        method: "POST",
        headers: {
          "content-type":
            "application/json",
        },
        body: JSON.stringify(input),
      },
    );

  return extractData(response);
}

export async function revokeApiKey(
  clientId: string,
  apiKeyId: string,
): Promise<void> {
  await request<void>(
    `/api/clients/${encodeURIComponent(
      clientId,
    )}/api-keys/${encodeURIComponent(
      apiKeyId,
    )}/revoke`,
    {
      method: "POST",
    },
  );
}