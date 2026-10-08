import type {
  CreatePaymentProviderPayload,
  PaymentProvider,
  PaymentProviderListParams,
  PaymentProviderListResponse,
  UpdatePaymentProviderPayload,
} from "../types/payment-provider.types";

const API_BASE = "/api";

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
// Response parsing
// ============================================================================

async function parseResponse<T>(
  response: Response,
): Promise<T> {
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
    throw new Error(
      getPaymentProviderErrorMessage(
        body,
        "An unexpected error occurred.",
      ),
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new Error(
      "The server returned an invalid response.",
    );
  }

  return body.data as T;
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

// ============================================================================
// Query
// ============================================================================

function buildQuery(
  params: PaymentProviderListParams,
): string {
  const searchParams =
    new URLSearchParams();

  if (
    params.page !==
    undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !==
    undefined
  ) {
    searchParams.set(
      "pageSize",
      String(params.pageSize),
    );
  }

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

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

// ============================================================================
// Find payment providers
// ============================================================================

export async function findPaymentProviders(
  params: PaymentProviderListParams = {},
): Promise<PaymentProviderListResponse> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers${buildQuery(
        params,
      )}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

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
    throw new Error(
      getPaymentProviderErrorMessage(
        body,
        "Unable to load payment providers.",
      ),
    );
  }

  if (
    !isPaymentProvidersListEnvelope(
      body,
    )
  ) {
    throw new Error(
      "Invalid payment providers response.",
    );
  }

  return {
    items:
      body.data.data,

    meta: {
      page:
        body.data.pagination.page,

      pageSize:
        body.data.pagination
          .pageSize,

      total:
        body.data.pagination
          .totalItems,

      totalPages:
        body.data.pagination
          .totalPages,
    },
  };
}

// ============================================================================
// Find payment provider
// ============================================================================

export async function findPaymentProviderById(
  providerId: string,
): Promise<PaymentProvider> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers/${encodeURIComponent(
        providerId,
      )}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

  return parseResponse<PaymentProvider>(
    response,
  );
}

// ============================================================================
// Create payment provider
// ============================================================================

export async function createPaymentProvider(
  payload: CreatePaymentProviderPayload,
): Promise<PaymentProvider> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload,
        ),
      },
    );

  return parseResponse<PaymentProvider>(
    response,
  );
}

// ============================================================================
// Update payment provider
// ============================================================================

export async function updatePaymentProvider(
  providerId: string,
  payload: UpdatePaymentProviderPayload,
): Promise<PaymentProvider> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers/${encodeURIComponent(
        providerId,
      )}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload,
        ),
      },
    );

  return parseResponse<PaymentProvider>(
    response,
  );
}

// ============================================================================
// Enable payment provider
// ============================================================================

export async function enablePaymentProvider(
  providerId: string,
): Promise<PaymentProvider> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers/${encodeURIComponent(
        providerId,
      )}/enable`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

  return parseResponse<PaymentProvider>(
    response,
  );
}

// ============================================================================
// Disable payment provider
// ============================================================================

export async function disablePaymentProvider(
  providerId: string,
): Promise<PaymentProvider> {
  const response =
    await fetch(
      `${API_BASE}/payment-providers/${encodeURIComponent(
        providerId,
      )}/disable`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

  return parseResponse<PaymentProvider>(
    response,
  );
}