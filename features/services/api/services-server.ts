import {
  cookies,
} from "next/headers";

import type {
  CreateServiceInput,
  FindServicesParams,
  Service,
  ServicesListResponse,
  UpdateServiceInput,
} from "./services-api";

// ============================================================================
// Control Plane response types
// ============================================================================

interface ServicesPaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ServicesListData {
  data: Service[];
  pagination: ServicesPaginationResponse;
}

interface ServicesListEnvelope {
  success: true;
  data: ServicesListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

// ============================================================================
// Error
// ============================================================================

export class ServicesApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "ServicesApiError";
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

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Find services
// ============================================================================

export async function findServices(
  params: FindServicesParams = {},
): Promise<ServicesListResponse> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ServicesApiError(
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

  if (params.category) {
    searchParams.set(
      "category",
      params.category,
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
      `${getControlPlaneUrl()}/api/services?${searchParams.toString()}`,
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
      "[Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ServicesApiError(
      "Unable to connect to the service API.",
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
    throw new ServicesApiError(
      getServiceErrorMessage(
        body,
        "Unable to load services.",
      ),
      response.status,
    );
  }

  if (!isServicesListEnvelope(body)) {
    throw new ServicesApiError(
      "Invalid services response.",
      response.status,
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
// Find service
// ============================================================================

export async function findServiceById(
  id: string,
): Promise<Service> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ServicesApiError(
      "Authentication required.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/services/${encodeURIComponent(id)}`,
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
      "[Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ServicesApiError(
      "Unable to connect to the service API.",
      502,
    );
  }

  return parseServiceResponse(
    response,
    "Unable to load service.",
  );
}

// ============================================================================
// Create service
// ============================================================================

export async function createService(
  input: CreateServiceInput,
): Promise<Service> {
  return mutateService(
    "/api/services",
    "POST",
    input,
    "Unable to create service.",
  );
}

// ============================================================================
// Update service
// ============================================================================

export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<Service> {
  return mutateService(
    `/api/services/${encodeURIComponent(id)}`,
    "PATCH",
    input,
    "Unable to update service.",
  );
}

// ============================================================================
// Enable service
// ============================================================================

export async function enableService(
  id: string,
): Promise<Service> {
  return mutateService(
    `/api/services/${encodeURIComponent(id)}/enable`,
    "PATCH",
    undefined,
    "Unable to enable service.",
  );
}

// ============================================================================
// Disable service
// ============================================================================

export async function disableService(
  id: string,
): Promise<Service> {
  return mutateService(
    `/api/services/${encodeURIComponent(id)}/disable`,
    "PATCH",
    undefined,
    "Unable to disable service.",
  );
}

// ============================================================================
// Shared mutation helper
// ============================================================================

async function mutateService(
  path: string,
  method: "POST" | "PATCH",
  input: unknown,
  fallbackMessage: string,
): Promise<Service> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ServicesApiError(
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
      "[Services] Failed to connect to Control Plane.",
      error,
    );

    throw new ServicesApiError(
      "Unable to connect to the service API.",
      502,
    );
  }

  return parseServiceResponse(
    response,
    fallbackMessage,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseServiceResponse(
  response: Response,
  fallbackMessage: string,
): Promise<Service> {
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
    throw new ServicesApiError(
      getServiceErrorMessage(
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
    throw new ServicesApiError(
      "Invalid service response.",
      response.status,
    );
  }

  return body.data as Service;
}

// ============================================================================
// Response validation
// ============================================================================

function isServicesListEnvelope(
  value: unknown,
): value is ServicesListEnvelope {
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

function getServiceErrorMessage(
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

  // Standard API error:
  //
  // {
  //   success: false,
  //   message: "...",
  //   error: {
  //     code: "...",
  //     message: "..."
  //   }
  // }
  //
  // Prefer the top-level message because this is the
  // sanitized message intended for API consumers.

  if (
    typeof response.message ===
    "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  // Some error envelopes may put the message inside
  // an error object.

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

  // NestJS validation errors can sometimes return
  // an array of messages.

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