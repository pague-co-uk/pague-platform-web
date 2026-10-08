// ============================================================================
// Types
// ============================================================================

export type ServiceCategory =
  | "MESSAGING"
  | "PAYMENTS";

export type ServiceStatus =
  | "ACTIVE"
  | "DISABLED";

export interface Service {
  readonly id: string;

  readonly code: string;

  readonly name: string;

  readonly description: string | null;

  readonly category: ServiceCategory;

  readonly status: ServiceStatus;

  readonly metadata:
  | Record<string, unknown>
  | null;

  readonly createdAt: string;

  readonly updatedAt: string;
}

export interface CreateServiceInput {
  readonly code: string;

  readonly name: string;

  readonly description?: string;

  readonly category: ServiceCategory;

  readonly metadata?: Record<string, unknown>;
}

export interface UpdateServiceInput {
  readonly name?: string;

  readonly description?: string;

  readonly category?: ServiceCategory;

  readonly metadata?: Record<string, unknown>;
}

export interface FindServicesParams {
  readonly page?: number;

  readonly pageSize?: number;

  readonly search?: string;

  readonly category?: ServiceCategory;

  readonly status?: ServiceStatus;

  readonly sort?: string;
}

export interface ServicesListResponse {
  readonly items: readonly Service[];

  readonly meta: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}
// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

// ============================================================================
// Types
// ============================================================================

export interface FindServicesParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly category?: ServiceCategory;
  readonly status?: ServiceStatus;
  readonly sort?: string;
}

export interface ServicesListResponse {
  readonly items: readonly Service[];

  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
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

    this.name =
      "ServicesApiError";

    this.status =
      status;
  }
}

// ============================================================================
// API response types
// ============================================================================

interface ApiMeta {
  readonly requestId: string;
  readonly timestamp: string;
}

interface ApiCollectionResponse<T> {
  readonly success: true;
  readonly data: readonly T[];

  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalItems: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;
  };

  readonly meta: ApiMeta;
}

// ============================================================================
// Find services
// ============================================================================

export async function findServices(
  params: FindServicesParams = {},
): Promise<ServicesListResponse> {
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

  const response =
    await fetch(
      `${API_BASE}/services?${searchParams.toString()}`,
      {
        method: "GET",

        credentials: "include",

        cache: "no-store",
      },
    );

  const body =
    await response
      .json()
      .catch(
        () => null,
      ) as unknown;

  if (!response.ok) {
    throw new ServicesApiError(
      getServiceErrorMessage(
        body,
        "Unable to load services.",
      ),
      response.status,
    );
  }

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
    throw new ServicesApiError(
      "Invalid services response.",
      response.status,
    );
  }

  const pagination =
    body.pagination;

  if (
    !("page" in pagination) ||
    !("pageSize" in pagination) ||
    !("totalItems" in pagination) ||
    !("totalPages" in pagination)
  ) {
    throw new ServicesApiError(
      "Invalid services pagination response.",
      response.status,
    );
  }

  return {
    items:
      body.data as Service[],

    meta: {
      page:
        Number(
          pagination.page,
        ),

      pageSize:
        Number(
          pagination.pageSize,
        ),

      total:
        Number(
          pagination.totalItems,
        ),

      totalPages:
        Number(
          pagination.totalPages,
        ),
    },
  };
}

// ============================================================================
// Find service
// ============================================================================

export async function findServiceById(
  id: string,
): Promise<Service> {
  return requestService(
    `/services/${encodeURIComponent(id)}`,
    "GET",
  );
}

// ============================================================================
// Create service
// ============================================================================

export async function createService(
  input: CreateServiceInput,
): Promise<Service> {
  return requestService(
    "/services",
    "POST",
    input,
  );
}

// ============================================================================
// Update service
// ============================================================================

export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<Service> {
  return requestService(
    `/services/${encodeURIComponent(id)}`,
    "PATCH",
    input,
  );
}

// ============================================================================
// Enable service
// ============================================================================

export async function enableService(
  id: string,
): Promise<Service> {
  return requestService(
    `/services/${encodeURIComponent(id)}/enable`,
    "PATCH",
  );
}

// ============================================================================
// Disable service
// ============================================================================

export async function disableService(
  id: string,
): Promise<Service> {
  return requestService(
    `/services/${encodeURIComponent(id)}/disable`,
    "PATCH",
  );
}

// ============================================================================
// Shared request
// ============================================================================

async function requestService(
  path: string,
  method: "GET" | "POST" | "PATCH",
  input?: unknown,
): Promise<Service> {
  const headers: HeadersInit = {};

  let body: string | undefined;

  if (input !== undefined) {
    headers["Content-Type"] =
      "application/json";

    body =
      JSON.stringify(input);
  }

  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        method,

        headers,

        credentials: "include",

        body,

        cache: "no-store",
      },
    );

  const result =
    await response
      .json()
      .catch(
        () => null,
      ) as unknown;

  if (!response.ok) {
    throw new ServicesApiError(
      getServiceErrorMessage(
        result,
        "Service request failed.",
      ),
      response.status,
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("success" in result) ||
    result.success !== true ||
    !("data" in result)
  ) {
    throw new ServicesApiError(
      "Invalid service response.",
      response.status,
    );
  }

  return result.data as Service;
}

// ============================================================================
// Error extraction
// ============================================================================

function getServiceErrorMessage(
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