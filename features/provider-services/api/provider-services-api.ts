import type {
  CreateProviderServicePayload,
  ProviderService,
  ProviderServiceListParams,
  ProviderServiceListResponse,
  UpdateProviderServicePayload,
} from "../types/provider-service.types";

const API_BASE = "/api";

// ============================================================================
// Control Plane response types
// ============================================================================

interface ProviderServicesPaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ProviderServicesListData {
  data: ProviderService[];
  pagination: ProviderServicesPaginationResponse;
}

interface ProviderServicesListEnvelope {
  success: true;
  data: ProviderServicesListData;
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
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getProviderServiceErrorMessage(
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

function isProviderServicesListEnvelope(
  value: unknown,
): value is ProviderServicesListEnvelope {
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
    typeof data.pagination !== "object" ||
    data.pagination === null
  ) {
    return false;
  }

  const pagination =
    data.pagination;

  return (
    "page" in pagination &&
    typeof pagination.page === "number" &&
    "pageSize" in pagination &&
    typeof pagination.pageSize === "number" &&
    "totalItems" in pagination &&
    typeof pagination.totalItems === "number" &&
    "totalPages" in pagination &&
    typeof pagination.totalPages === "number" &&
    "hasNext" in pagination &&
    typeof pagination.hasNext === "boolean" &&
    "hasPrevious" in pagination &&
    typeof pagination.hasPrevious === "boolean"
  );
}

// ============================================================================
// Error extraction
// ============================================================================

function getProviderServiceErrorMessage(
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
    body as Record<string, unknown>;

  if (
    typeof response.message === "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  if (
    typeof response.error === "object" &&
    response.error !== null
  ) {
    const error =
      response.error as Record<
        string,
        unknown
      >;

    if (
      typeof error.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      typeof error.detail === "string" &&
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
          typeof value === "string",
      );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return fallbackMessage;
}

// ============================================================================
// Query
// ============================================================================

function buildQuery(
  params: ProviderServiceListParams,
): string {
  const searchParams =
    new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.pageSize !== undefined) {
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

  if (params.active !== undefined) {
    searchParams.set(
      "active",
      String(params.active),
    );
  }

  if (params.providerCode) {
    searchParams.set(
      "providerCode",
      params.providerCode,
    );
  }

  if (params.serviceCode) {
    searchParams.set(
      "serviceCode",
      params.serviceCode,
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
// Find provider services
// ============================================================================

export async function findProviderServices(
  params: ProviderServiceListParams = {},
): Promise<ProviderServiceListResponse> {
  const response =
    await fetch(
      `${API_BASE}/provider-services${buildQuery(
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
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getProviderServiceErrorMessage(
        body,
        "Unable to load provider services.",
      ),
    );
  }

  if (
    !isProviderServicesListEnvelope(
      body,
    )
  ) {
    throw new Error(
      "Invalid provider services response.",
    );
  }

  return {
    items: body.data.data,

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
// Find provider service
// ============================================================================

export async function findProviderServiceById(
  providerServiceId: string,
): Promise<ProviderService> {
  const response =
    await fetch(
      `${API_BASE}/provider-services/${encodeURIComponent(
        providerServiceId,
      )}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

  return parseResponse<ProviderService>(
    response,
  );
}

// ============================================================================
// Create provider service
// ============================================================================

export async function createProviderService(
  payload: CreateProviderServicePayload,
): Promise<ProviderService> {
  const response =
    await fetch(
      `${API_BASE}/provider-services`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

  return parseResponse<ProviderService>(
    response,
  );
}

// ============================================================================
// Update provider service
// ============================================================================

export async function updateProviderService(
  providerServiceId: string,
  payload: UpdateProviderServicePayload,
): Promise<ProviderService> {
  const response =
    await fetch(
      `${API_BASE}/provider-services/${encodeURIComponent(
        providerServiceId,
      )}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

  return parseResponse<ProviderService>(
    response,
  );
}

// ============================================================================
// Enable provider service
// ============================================================================

export async function enableProviderService(
  providerServiceId: string,
): Promise<ProviderService> {
  const response =
    await fetch(
      `${API_BASE}/provider-services/${encodeURIComponent(
        providerServiceId,
      )}/enable`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

  return parseResponse<ProviderService>(
    response,
  );
}

// ============================================================================
// Disable provider service
// ============================================================================

export async function disableProviderService(
  providerServiceId: string,
): Promise<ProviderService> {
  const response =
    await fetch(
      `${API_BASE}/provider-services/${encodeURIComponent(
        providerServiceId,
      )}/disable`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

  return parseResponse<ProviderService>(
    response,
  );
}