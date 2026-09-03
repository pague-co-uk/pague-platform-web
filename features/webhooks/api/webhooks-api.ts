export interface Webhook {
  id: string;
  publicId: string;
  name: string;
  url: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookSecretResponse
  extends Webhook {
  secret: string;
}

export interface WebhookDelivery {
  id: string;
  webhookEndpointId: string;
  messageId: string;
  attemptNumber: number;
  responseCode: number | null;
  responseBody: string | null;
  attemptedAt: string;
}

// ============================================================================
// Pagination
// ============================================================================

export interface WebhookPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// Query parameters
// ============================================================================

export interface FindWebhooksParams {
  clientId: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface FindWebhookDeliveriesParams {
  clientId: string;
  webhookId: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Query results
// ============================================================================

export interface FindWebhooksResult {
  data: Webhook[];
  pagination: WebhookPagination;
}

export interface FindWebhookDeliveriesResult {
  data: WebhookDelivery[];
  pagination: WebhookPagination;
}

// ============================================================================
// Inputs
// ============================================================================

export interface CreateWebhookInput {
  clientId: string;
  name: string;
  url: string;
}

export interface UpdateWebhookInput {
  clientId: string;
  name?: string;
  url?: string;
  enabled?: boolean;
}

// ============================================================================
// Error
// ============================================================================

export class WebhooksApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "WebhooksApiError";

    this.status =
      status;
  }
}

// ============================================================================
// API responses
// ============================================================================

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

interface WebhookResponseEnvelope {
  success: boolean;
  data: Webhook;
}

interface WebhookSecretResponseEnvelope {
  success: boolean;
  data: WebhookSecretResponse;
}

interface PaginatedResponseEnvelope<T> {
  success: boolean;
  data: T[];
  pagination: WebhookPagination;
}

// ============================================================================
// Error extraction
// ============================================================================

function getWebhookErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    body &&
    typeof body === "object"
  ) {
    const errorBody =
      body as ApiErrorResponse;

    if (
      Array.isArray(
        errorBody.message,
      )
    ) {
      return errorBody.message.join(
        ", ",
      );
    }

    if (
      typeof errorBody.message ===
      "string"
    ) {
      return errorBody.message;
    }

    if (
      typeof errorBody.error ===
      "string"
    ) {
      return errorBody.error;
    }
  }

  return fallback;
}

// ============================================================================
// Query strings
// ============================================================================

function buildQueryString(
  params: Omit<
    FindWebhooksParams,
    "clientId"
  >,
): string {
  const searchParams =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
  ) {
    searchParams.set(
      "pageSize",
      String(params.pageSize),
    );
  }

  if (
    params.enabled !== undefined
  ) {
    searchParams.set(
      "enabled",
      String(params.enabled),
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

function buildDeliveryQueryString(
  params: Omit<
    FindWebhookDeliveriesParams,
    "clientId" | "webhookId"
  >,
): string {
  const searchParams =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
  ) {
    searchParams.set(
      "pageSize",
      String(params.pageSize),
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new WebhooksApiError(
      getWebhookErrorMessage(
        body,
        fallbackMessage,
      ),
      response.status,
    );
  }

  return body as T;
}

// ============================================================================
// Find webhooks
// ============================================================================

export async function findWebhooks(
  params: FindWebhooksParams,
): Promise<FindWebhooksResult> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        params.clientId,
      )}/webhooks${buildQueryString(
        params,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      PaginatedResponseEnvelope<Webhook>
    >(
      response,
      "Failed to retrieve webhooks.",
    );

  return {
    data:
      Array.isArray(body.data)
        ? body.data
        : [],

    pagination:
      body.pagination,
  };
}

// ============================================================================
// Find webhook by ID
// ============================================================================

export async function findWebhookById(
  clientId: string,
  id: string,
): Promise<Webhook> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      WebhookResponseEnvelope
    >(
      response,
      "Failed to retrieve webhook.",
    );

  return body.data;
}

// ============================================================================
// Find webhook by public ID
// ============================================================================

export async function findWebhookByPublicId(
  clientId: string,
  publicId: string,
): Promise<Webhook> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/public/${encodeURIComponent(
        publicId,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      WebhookResponseEnvelope
    >(
      response,
      "Failed to retrieve webhook.",
    );

  return body.data;
}

// ============================================================================
// Create webhook
// ============================================================================

export async function createWebhook(
  input: CreateWebhookInput,
): Promise<WebhookSecretResponse> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        input.clientId,
      )}/webhooks`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "content-type":
            "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          url: input.url,
        }),
      },
    );

  const body =
    await parseResponse<
      WebhookSecretResponseEnvelope
    >(
      response,
      "Failed to create webhook.",
    );

  return body.data;
}

// ============================================================================
// Update webhook
// ============================================================================

export async function updateWebhook(
  input: UpdateWebhookInput,
  id: string,
): Promise<Webhook> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        input.clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: {
          "content-type":
            "application/json",
        },
        body: JSON.stringify({
          ...(input.name !== undefined
            ? {
              name: input.name,
            }
            : {}),

          ...(input.url !== undefined
            ? {
              url: input.url,
            }
            : {}),

          ...(input.enabled !== undefined
            ? {
              enabled: input.enabled,
            }
            : {}),
        }),
      },
    );

  const body =
    await parseResponse<
      WebhookResponseEnvelope
    >(
      response,
      "Failed to update webhook.",
    );

  return body.data;
}

// ============================================================================
// Enable webhook
// ============================================================================

export async function enableWebhook(
  clientId: string,
  id: string,
): Promise<Webhook> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/enable`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      WebhookResponseEnvelope
    >(
      response,
      "Failed to enable webhook.",
    );

  return body.data;
}

// ============================================================================
// Disable webhook
// ============================================================================

export async function disableWebhook(
  clientId: string,
  id: string,
): Promise<Webhook> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/disable`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      WebhookResponseEnvelope
    >(
      response,
      "Failed to disable webhook.",
    );

  return body.data;
}

// ============================================================================
// Rotate secret
// ============================================================================

export async function rotateWebhookSecret(
  clientId: string,
  id: string,
): Promise<WebhookSecretResponse> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/rotate-secret`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      WebhookSecretResponseEnvelope
    >(
      response,
      "Failed to rotate webhook secret.",
    );

  return body.data;
}

// ============================================================================
// Delete webhook
// ============================================================================

export async function deleteWebhook(
  clientId: string,
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (response.ok) {
    return;
  }

  const body =
    await response
      .json()
      .catch(() => null);

  throw new WebhooksApiError(
    getWebhookErrorMessage(
      body,
      "Failed to delete webhook.",
    ),
    response.status,
  );
}

// ============================================================================
// Find deliveries
// ============================================================================

export async function findWebhookDeliveries(
  params: FindWebhookDeliveriesParams,
): Promise<FindWebhookDeliveriesResult> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        params.clientId,
      )}/webhooks/${encodeURIComponent(
        params.webhookId,
      )}/deliveries${buildDeliveryQueryString(
        params,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<
      PaginatedResponseEnvelope<WebhookDelivery>
    >(
      response,
      "Failed to retrieve webhook deliveries.",
    );

  return {
    data:
      Array.isArray(body.data)
        ? body.data
        : [],

    pagination:
      body.pagination,
  };
}