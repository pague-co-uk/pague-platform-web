import { cookies } from "next/headers";

import type {
  ClientService,
  ClientServiceListParams,
  ClientServiceListResponse,
  CreateClientServicePayload,
  UpdateClientServicePayload,
} from "../types/client-service.types";

export class ClientServicesApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "ClientServicesApiError";
    this.status = status;
  }
}

interface ApiErrorResponse {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown[];
  };
  message?: string;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

interface ClientServicesListData {
  data: ClientService[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

function getControlPlaneUrl(): string {
  const url = process.env.CONTROL_PLANE_API_URL?.trim();

  if (!url) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return url.replace(/\/+$/, "");
}

async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore
    .get("session")
    ?.value;
}

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

  if (Array.isArray(response.message)) {
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

async function parseServiceResponse<T>(
  response: Response,
): Promise<T> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new ClientServicesApiError(
      response.ok
        ? "Invalid response received from the Control Plane API."
        : "The Control Plane API returned an invalid error response.",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ClientServicesApiError(
      getServiceErrorMessage(
        body,
        "An unexpected error occurred.",
      ),
      response.status,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    (body as Record<string, unknown>)
      .success !== true
  ) {
    throw new ClientServicesApiError(
      "The Control Plane API returned an invalid response.",
      response.status,
    );
  }

  return (
    body as ApiSuccessResponse<T>
  ).data;
}

async function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const controlPlaneUrl =
    getControlPlaneUrl();

  const sessionCookie =
    await getSessionCookie();

  const headers = new Headers(
    init.headers,
  );

  headers.set(
    "Accept",
    "application/json",
  );

  if (init.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (sessionCookie) {
    headers.set(
      "Cookie",
      `session=${sessionCookie}`,
    );
  }

  return fetch(
    `${controlPlaneUrl}${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
    },
  );
}

export async function findClientServices(
  clientId: string,
  params: ClientServiceListParams = {},
): Promise<ClientServiceListResponse> {
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

  const response =
    await request(
      `/api/clients/${clientId}/services${query ? `?${query}` : ""
      }`,
      {
        method: "GET",
      },
    );

  const body =
    await parseServiceResponse<ClientServicesListData>(
      response,
    );

  return {
    items: body.data,
    meta: {
      page:
        body.pagination.page,
      pageSize:
        body.pagination.pageSize,
      total:
        body.pagination.totalItems,
      totalPages:
        body.pagination.totalPages,
    },
  };
}

export async function findClientServiceById(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response =
    await request(
      `/api/clients/${clientId}/services/${serviceId}`,
      {
        method: "GET",
      },
    );

  return parseServiceResponse<ClientService>(
    response,
  );
}

export async function createClientService(
  clientId: string,
  payload: CreateClientServicePayload,
): Promise<ClientService> {
  const response =
    await request(
      `/api/clients/${clientId}/services`,
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );

  return parseServiceResponse<ClientService>(
    response,
  );
}

export async function updateClientService(
  clientId: string,
  serviceId: string,
  payload: UpdateClientServicePayload,
): Promise<ClientService> {
  const response =
    await request(
      `/api/clients/${clientId}/services/${serviceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          payload,
        ),
      },
    );

  return parseServiceResponse<ClientService>(
    response,
  );
}

export async function enableClientService(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response =
    await request(
      `/api/clients/${clientId}/services/${serviceId}/enable`,
      {
        method: "PATCH",
      },
    );

  return parseServiceResponse<ClientService>(
    response,
  );
}

export async function disableClientService(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response =
    await request(
      `/api/clients/${clientId}/services/${serviceId}/disable`,
      {
        method: "PATCH",
      },
    );

  return parseServiceResponse<ClientService>(
    response,
  );
}