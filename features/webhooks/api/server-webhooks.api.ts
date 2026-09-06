import "server-only";

import {
  cookies,
} from "next/headers";

import type {
  CreateWebhookInput,
  FindPlatformWebhooksParams,
  FindPlatformWebhooksResult,
  FindWebhookDeliveriesParams,
  FindWebhookDeliveriesResult,
  FindWebhooksParams,
  FindWebhooksResult,
  UpdateWebhookInput,
  Webhook,
  WebhookDelivery,
  WebhookSecretResponse,
} from "./webhooks-api";

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
    this.name = "WebhooksApiError";
    this.status = status;
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

  return value.replace(/\/+$/, "");
}

// ============================================================================
// Request helper
// ============================================================================

async function controlPlaneFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new WebhooksApiError(
      "Authentication required.",
      401,
    );
  }

  try {
    return await fetch(
      `${getControlPlaneUrl()}${path}`,
      {
        ...options,
        headers: {
          ...options.headers,
          Cookie:
            `${session.name}=${session.value}`,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "[Webhooks] Failed to connect to Control Plane.",
      error,
    );

    throw new WebhooksApiError(
      "Unable to connect to the webhook service.",
      502,
    );
  }
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseResponse(
  response: Response,
  fallbackMessage: string,
): Promise<unknown> {
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
    throw new WebhooksApiError(
      getWebhookErrorMessage(
        body,
        fallbackMessage,
      ),
      response.status,
    );
  }

  return body;
}

// ============================================================================
// API envelope
// ============================================================================

function extractData(
  body: unknown,
  fallbackMessage: string,
): unknown {
  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new WebhooksApiError(
      fallbackMessage,
      502,
    );
  }

  return body.data;
}

// ============================================================================
// Paginated response
// ============================================================================

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

function extractPaginatedData<T>(
  body: unknown,
  fallbackMessage: string,
): PaginatedApiResponse<T> {
  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    !Array.isArray(body.data) ||
    !("pagination" in body) ||
    typeof body.pagination !== "object" ||
    body.pagination === null
  ) {
    throw new WebhooksApiError(
      fallbackMessage,
      502,
    );
  }

  return body as PaginatedApiResponse<T>;
}

// ============================================================================
// Find webhooks
// ============================================================================

export async function findWebhooks(
  params: FindWebhooksParams,
): Promise<FindWebhooksResult> {
  const query =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    query.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
  ) {
    query.set(
      "pageSize",
      String(params.pageSize),
    );
  }

  if (
    params.enabled !== undefined
  ) {
    query.set(
      "enabled",
      String(params.enabled),
    );
  }

  const queryString =
    query.toString();

  const path =
    `/api/clients/${encodeURIComponent(
      params.clientId,
    )}/webhooks${queryString
      ? `?${queryString}`
      : ""
    }`;

  const response =
    await controlPlaneFetch(
      path,
      {
        method: "GET",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to load webhooks.",
    );

  const result =
    extractPaginatedData<Webhook>(
      body,
      "Invalid webhooks response.",
    );

  return {
    data:
      result.data,

    pagination:
      result.pagination,
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
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to load webhook.",
    );

  return extractData(
    body,
    "Invalid webhook response.",
  ) as Webhook;
}

// ============================================================================
// Find webhook by public ID
// ============================================================================

export async function findWebhookByPublicId(
  clientId: string,
  publicId: string,
): Promise<Webhook> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/public/${encodeURIComponent(
        publicId,
      )}`,
      {
        method: "GET",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to load webhook.",
    );

  return extractData(
    body,
    "Invalid webhook response.",
  ) as Webhook;
}

// ============================================================================
// Create webhook
// ============================================================================

export async function createWebhook(
  input: CreateWebhookInput,
): Promise<WebhookSecretResponse> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        input.clientId,
      )}/webhooks`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          url: input.url,
        }),
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to create webhook.",
    );

  return extractData(
    body,
    "Invalid webhook creation response.",
  ) as WebhookSecretResponse;
}

// ============================================================================
// Update webhook
// ============================================================================

export async function updateWebhook(
  id: string,
  input: UpdateWebhookInput,
): Promise<Webhook> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        input.clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
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
    await parseResponse(
      response,
      "Unable to update webhook.",
    );

  return extractData(
    body,
    "Invalid webhook update response.",
  ) as Webhook;
}

// ============================================================================
// Enable webhook
// ============================================================================

export async function enableWebhook(
  clientId: string,
  id: string,
): Promise<Webhook> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/enable`,
      {
        method: "POST",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to enable webhook.",
    );

  return extractData(
    body,
    "Invalid webhook response.",
  ) as Webhook;
}

// ============================================================================
// Disable webhook
// ============================================================================

export async function disableWebhook(
  clientId: string,
  id: string,
): Promise<Webhook> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/disable`,
      {
        method: "POST",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to disable webhook.",
    );

  return extractData(
    body,
    "Invalid webhook response.",
  ) as Webhook;
}

// ============================================================================
// Rotate secret
// ============================================================================

export async function rotateWebhookSecret(
  clientId: string,
  id: string,
): Promise<WebhookSecretResponse> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}/rotate-secret`,
      {
        method: "POST",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to rotate webhook secret.",
    );

  return extractData(
    body,
    "Invalid webhook secret response.",
  ) as WebhookSecretResponse;
}

// ============================================================================
// Delete webhook
// ============================================================================

export async function deleteWebhook(
  clientId: string,
  id: string,
): Promise<void> {
  const response =
    await controlPlaneFetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/webhooks/${encodeURIComponent(
        id,
      )}`,
      {
        method: "DELETE",
      },
    );

  if (response.status === 204) {
    return;
  }

  await parseResponse(
    response,
    "Unable to delete webhook.",
  );
}

// ============================================================================
// Find deliveries
// ============================================================================

export async function findWebhookDeliveries(
  params: FindWebhookDeliveriesParams,
): Promise<FindWebhookDeliveriesResult> {
  const query =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    query.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
  ) {
    query.set(
      "pageSize",
      String(params.pageSize),
    );
  }

  const queryString =
    query.toString();

  const path =
    `/api/clients/${encodeURIComponent(
      params.clientId,
    )}/webhooks/${encodeURIComponent(
      params.webhookId,
    )}/deliveries${queryString
      ? `?${queryString}`
      : ""
    }`;

  const response =
    await controlPlaneFetch(
      path,
      {
        method: "GET",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to load webhook deliveries.",
    );

  const result =
    extractPaginatedData<WebhookDelivery>(
      body,
      "Invalid webhook deliveries response.",
    );

  return {
    data:
      result.data,

    pagination:
      result.pagination,
  };
}

// ============================================================================
// Error extraction
// ============================================================================

function getWebhookErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return fallback;
  }

  if (
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string" &&
    data.error.message.trim()
  ) {
    return data.error.message;
  }

  if (
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}

// ============================================================================
// Find platform webhooks
// ============================================================================

export async function findPlatformWebhooks(
  params: FindPlatformWebhooksParams = {},
): Promise<FindPlatformWebhooksResult> {
  const query =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    query.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
  ) {
    query.set(
      "pageSize",
      String(params.pageSize),
    );
  }

  if (
    params.clientId !== undefined
  ) {
    query.set(
      "clientId",
      params.clientId,
    );
  }

  if (
    params.enabled !== undefined
  ) {
    query.set(
      "enabled",
      String(params.enabled),
    );
  }

  if (
    params.search !== undefined &&
    params.search.trim() !== ""
  ) {
    query.set(
      "search",
      params.search.trim(),
    );
  }

  const queryString =
    query.toString();

  const path =
    `/api/webhooks${queryString
      ? `?${queryString}`
      : ""
    }`;

  const response =
    await controlPlaneFetch(
      path,
      {
        method: "GET",
      },
    );

  const body =
    await parseResponse(
      response,
      "Unable to load webhooks.",
    );

  const result =
    extractPaginatedData<Webhook>(
      body,
      "Invalid webhooks response.",
    );

  return {
    data:
      result.data,

    pagination:
      result.pagination,
  };
}