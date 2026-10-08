import {
  cookies,
} from "next/headers";

import type {
  CreatePaymentProviderPayload,
  PaymentProvider,
  PaymentProviderListParams,
  PaymentProviderListResponse,
  UpdatePaymentProviderPayload,
} from "../types/payment-provider.types";

// ============================================================================
// Control Plane response types
// ============================================================================

interface PaymentProvidersPaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaymentProvidersListData {
  data: PaymentProvider[];
  pagination: PaymentProvidersPaginationResponse;
}

interface PaymentProvidersListEnvelope {
  success: true;
  data: PaymentProvidersListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

// ============================================================================
// Error
// ============================================================================

export class PaymentProvidersApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "PaymentProvidersApiError";

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
    throw new PaymentProvidersApiError(
      "CONTROL_PLANE_API_URL is not configured.",
      500,
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Find payment providers
// ============================================================================

export async function findPaymentProviders(
  params: PaymentProviderListParams = {},
): Promise<PaymentProviderListResponse> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new PaymentProvidersApiError(
      "Authentication required.",
      401,
    );
  }

  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "pageSize",
    String(params.pageSize ?? 20),
  );

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.sort) {
    searchParams.set(
      "sort",
      params.sort,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/payment-providers?${searchParams.toString()}`,
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
      "[Payment Providers] Failed to connect to Control Plane.",
      error,
    );

    throw new PaymentProvidersApiError(
      "Unable to connect to the payment provider API.",
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
    throw new PaymentProvidersApiError(
      getPaymentProviderErrorMessage(
        body,
        "Unable to load payment providers.",
      ),
      response.status,
    );
  }

  if (
    !isPaymentProvidersListEnvelope(
      body,
    )
  ) {
    throw new PaymentProvidersApiError(
      "Invalid payment providers response.",
      response.status,
    );
  }

  return {
    items:
      body.data.data,

    meta: {
      page:
        body.data.pagination.page,

      pageSize:
        body.data.pagination.pageSize,

      total:
        body.data.pagination.totalItems,

      totalPages:
        body.data.pagination.totalPages,
    },
  };
}

// ============================================================================
// Find payment provider
// ============================================================================

export async function findPaymentProviderById(
  id: string,
): Promise<PaymentProvider> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new PaymentProvidersApiError(
      "Authentication required.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/payment-providers/${encodeURIComponent(id)}`,
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
      "[Payment Providers] Failed to connect to Control Plane.",
      error,
    );

    throw new PaymentProvidersApiError(
      "Unable to connect to the payment provider API.",
      502,
    );
  }

  return parsePaymentProviderResponse(
    response,
    "Unable to load payment provider.",
  );
}

// ============================================================================
// Create payment provider
// ============================================================================

export async function createPaymentProvider(
  input: CreatePaymentProviderPayload,
): Promise<PaymentProvider> {
  return mutatePaymentProvider(
    "/api/payment-providers",
    "POST",
    input,
    "Unable to create payment provider.",
  );
}

// ============================================================================
// Update payment provider
// ============================================================================

export async function updatePaymentProvider(
  id: string,
  input: UpdatePaymentProviderPayload,
): Promise<PaymentProvider> {
  return mutatePaymentProvider(
    `/api/payment-providers/${encodeURIComponent(id)}`,
    "PATCH",
    input,
    "Unable to update payment provider.",
  );
}

// ============================================================================
// Enable payment provider
// ============================================================================

export async function enablePaymentProvider(
  id: string,
): Promise<PaymentProvider> {
  return mutatePaymentProvider(
    `/api/payment-providers/${encodeURIComponent(id)}/enable`,
    "PATCH",
    undefined,
    "Unable to enable payment provider.",
  );
}

// ============================================================================
// Disable payment provider
// ============================================================================

export async function disablePaymentProvider(
  id: string,
): Promise<PaymentProvider> {
  return mutatePaymentProvider(
    `/api/payment-providers/${encodeURIComponent(id)}/disable`,
    "PATCH",
    undefined,
    "Unable to disable payment provider.",
  );
}

// ============================================================================
// Shared mutation helper
// ============================================================================

async function mutatePaymentProvider(
  path: string,
  method: "POST" | "PATCH",
  input: unknown,
  fallbackMessage: string,
): Promise<PaymentProvider> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new PaymentProvidersApiError(
      "Authentication required.",
      401,
    );
  }

  const headers: HeadersInit = {
    Cookie:
      `${session.name}=${session.value}`,
  };

  let body: string | undefined;

  if (input !== undefined) {
    headers["Content-Type"] =
      "application/json";

    body =
      JSON.stringify(input);
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}${path}`,
      {
        method,
        headers,
        body,
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "[Payment Providers] Failed to connect to Control Plane.",
      error,
    );

    throw new PaymentProvidersApiError(
      "Unable to connect to the payment provider API.",
      502,
    );
  }

  return parsePaymentProviderResponse(
    response,
    fallbackMessage,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

async function parsePaymentProviderResponse(
  response: Response,
  fallbackMessage: string,
): Promise<PaymentProvider> {
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
    throw new PaymentProvidersApiError(
      getPaymentProviderErrorMessage(
        body,
        fallbackMessage,
      ),
      response.status,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new PaymentProvidersApiError(
      "Invalid payment provider response.",
      response.status,
    );
  }

  return body.data as PaymentProvider;
}

// ============================================================================
// Response validation
// ============================================================================

function isPaymentProvidersListEnvelope(
  value: unknown,
): value is PaymentProvidersListEnvelope {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  if (
    !("success" in value) ||
    value.success !== true
  ) {
    return false;
  }

  if (
    !("data" in value) ||
    typeof value.data !== "object" ||
    value.data === null
  ) {
    return false;
  }

  const data =
    value.data;

  if (
    !("data" in data) ||
    !Array.isArray(data.data)
  ) {
    return false;
  }

  if (
    !("pagination" in data) ||
    typeof data.pagination !==
    "object" ||
    data.pagination === null
  ) {
    return false;
  }

  const pagination =
    data.pagination;

  return (
    "page" in pagination &&
    typeof pagination.page ===
    "number" &&

    "pageSize" in pagination &&
    typeof pagination.pageSize ===
    "number" &&

    "totalItems" in pagination &&
    typeof pagination.totalItems ===
    "number" &&

    "totalPages" in pagination &&
    typeof pagination.totalPages ===
    "number" &&

    "hasNext" in pagination &&
    typeof pagination.hasNext ===
    "boolean" &&

    "hasPrevious" in pagination &&
    typeof pagination.hasPrevious ===
    "boolean"
  );
}

// ============================================================================
// Error extraction
// ============================================================================

function getPaymentProviderErrorMessage(
  body: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return fallbackMessage;
  }

  const response =
    body as Record<
      string,
      unknown
    >;

  if (
    typeof response.message ===
    "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  if (
    typeof response.error ===
    "object" &&
    response.error !== null
  ) {
    const error =
      response.error as Record<
        string,
        unknown
      >;

    if (
      typeof error.message ===
      "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      typeof error.detail ===
      "string" &&
      error.detail.trim()
    ) {
      return error.detail;
    }
  }

  if (
    Array.isArray(response.message)
  ) {
    const messages =
      response.message.filter(
        (
          value,
        ): value is string =>
          typeof value ===
          "string",
      );

    if (
      messages.length > 0
    ) {
      return messages.join(
        ", ",
      );
    }
  }

  return fallbackMessage;
}