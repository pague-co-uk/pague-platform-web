import {
  cookies,
} from "next/headers";

import type {
  CreateProviderServicePayload,
  ProviderService,
  ProviderServiceListParams,
  ProviderServiceListResponse,
  UpdateProviderServicePayload,
} from "../types/provider-service.types";

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
// Error
// ============================================================================

export class ProviderServicesApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ProviderServicesApiError";

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
    throw new ProviderServicesApiError(
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
// Find provider services
// ============================================================================

export async function findProviderServices(
  params: ProviderServiceListParams = {},
): Promise<ProviderServiceListResponse> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ProviderServicesApiError(
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

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/provider-services?${searchParams.toString()}`,
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
      "[Provider Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ProviderServicesApiError(
      "Unable to connect to the provider service API.",
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
    throw new ProviderServicesApiError(
      getProviderServiceErrorMessage(
        body,
        "Unable to load provider services.",
      ),
      response.status,
    );
  }

  if (
    !isProviderServicesListEnvelope(
      body,
    )
  ) {
    throw new ProviderServicesApiError(
      "Invalid provider services response.",
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
// Find provider service
// ============================================================================

export async function findProviderServiceById(
  id: string,
): Promise<ProviderService> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ProviderServicesApiError(
      "Authentication required.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/provider-services/${encodeURIComponent(id)}`,
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
      "[Provider Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ProviderServicesApiError(
      "Unable to connect to the provider service API.",
      502,
    );
  }

  return parseProviderServiceResponse(
    response,
    "Unable to load provider service.",
  );
}

// ============================================================================
// Create provider service
// ============================================================================

export async function createProviderService(
  input: CreateProviderServicePayload,
): Promise<ProviderService> {
  return mutateProviderService(
    "/api/provider-services",
    "POST",
    input,
    "Unable to create provider service.",
  );
}

// ============================================================================
// Update provider service
// ============================================================================

export async function updateProviderService(
  id: string,
  input: UpdateProviderServicePayload,
): Promise<ProviderService> {
  return mutateProviderService(
    `/api/provider-services/${encodeURIComponent(id)}`,
    "PATCH",
    input,
    "Unable to update provider service.",
  );
}

// ============================================================================
// Enable provider service
// ============================================================================

export async function enableProviderService(
  id: string,
): Promise<ProviderService> {
  return mutateProviderService(
    `/api/provider-services/${encodeURIComponent(id)}/enable`,
    "PATCH",
    undefined,
    "Unable to enable provider service.",
  );
}

// ============================================================================
// Disable provider service
// ============================================================================

export async function disableProviderService(
  id: string,
): Promise<ProviderService> {
  return mutateProviderService(
    `/api/provider-services/${encodeURIComponent(id)}/disable`,
    "PATCH",
    undefined,
    "Unable to disable provider service.",
  );
}

// ============================================================================
// Shared mutation helper
// ============================================================================

async function mutateProviderService(
  path: string,
  method: "POST" | "PATCH",
  input: unknown,
  fallbackMessage: string,
): Promise<ProviderService> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ProviderServicesApiError(
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
      "[Provider Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ProviderServicesApiError(
      "Unable to connect to the provider service API.",
      502,
    );
  }

  return parseProviderServiceResponse(
    response,
    fallbackMessage,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseProviderServiceResponse(
  response: Response,
  fallbackMessage: string,
): Promise<ProviderService> {
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
    throw new ProviderServicesApiError(
      getProviderServiceErrorMessage(
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
    throw new ProviderServicesApiError(
      "Invalid provider service response.",
      response.status,
    );
  }

  return body.data as ProviderService;
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
    body as Record<
      string,
      unknown
    >;

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