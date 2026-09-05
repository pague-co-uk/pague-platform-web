export type ApiKeyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";

export interface ApiKey {
  id: string;
  publicId: string;
  clientId: string;
  name: string;
  prefix: string;
  status: ApiKeyStatus;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyCreatedResponse {
  apiKeyId: string;
  publicId: string;
  apiKey: string;
  prefix: string;
  expiresAt: string | null;
}

export interface ApiKeyPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ApiKeyPaginatedResponse {
  success: boolean;
  data: ApiKey[];
  pagination: ApiKeyPagination;
}

interface ApiKeyResponse<T> {
  success: boolean;
  data: T;
}

const parseResponse = async <T>(
  response: Response,
): Promise<T> => {
  const body =
    await response.text();

  if (!response.ok) {
    throw new Error(
      body ||
      `API request failed with status ${response.status}.`,
    );
  }

  if (
    response.status === 204 ||
    !body
  ) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
};

// ============================================================================
// Find API keys
// ============================================================================

export async function findApiKeys(
  clientId: string,
  options?: {
    page?: number;
    pageSize?: number;
    status?: ApiKeyStatus;
  },
): Promise<{
  data: ApiKey[];
  pagination: ApiKeyPagination;
}> {
  const searchParams =
    new URLSearchParams();

  if (
    options?.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(options.page),
    );
  }

  if (
    options?.pageSize !== undefined
  ) {
    searchParams.set(
      "pageSize",
      String(options.pageSize),
    );
  }

  if (
    options?.status !== undefined
  ) {
    searchParams.set(
      "status",
      options.status,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<ApiKeyPaginatedResponse>(
      response,
    );

  if (!body.success) {
    throw new Error(
      "Unable to retrieve API keys.",
    );
  }

  return {
    data: Array.isArray(body.data)
      ? body.data
      : [],
    pagination:
      body.pagination,
  };
}

// ============================================================================
// Revoke API key
// ============================================================================

export async function revokeApiKey(
  clientId: string,
  apiKeyId: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys/${encodeURIComponent(
        apiKeyId,
      )}/revoke`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

  await parseResponse<void>(
    response,
  );
}

// ============================================================================
// Create API key
// ============================================================================

export interface CreateApiKeyInput {
  clientId: string;
  name: string;
  expiresAt?: string;
  capabilities: readonly string[];
}

export async function createApiKey(
  input: CreateApiKeyInput,
): Promise<ApiKeyCreatedResponse> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        input.clientId,
      )}/api-keys`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          capabilities:
            input.capabilities,
          ...(input.expiresAt
            ? {
              expiresAt:
                input.expiresAt,
            }
            : {}),
        }),
      },
    );

  const body =
    await parseResponse<
      ApiKeyResponse<ApiKeyCreatedResponse>
    >(response);

  if (!body.success) {
    throw new Error(
      "Unable to create API key.",
    );
  }

  return body.data;
}

// ============================================================================
// Find API key
// ============================================================================

export async function findApiKey(
  clientId: string,
  apiKeyId: string,
): Promise<ApiKey> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys/${encodeURIComponent(
        apiKeyId,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      ApiKeyResponse<ApiKey>
    >(response);

  if (!body.success) {
    throw new Error(
      "Unable to retrieve API key.",
    );
  }

  return body.data;
}