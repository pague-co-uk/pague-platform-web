import type {
  ClientService,
  ClientServiceListParams,
  ClientServiceListResponse,
  CreateClientServicePayload,
  UpdateClientServicePayload,
} from "../types/client-service.types";

const API_BASE = "/api";

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response.",
    );
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "object" &&
        body.error !== null &&
        "message" in body.error &&
        typeof body.error.message === "string"
        ? body.error.message
        : typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
          ? body.message
          : "An unexpected error occurred.";

    throw new Error(message);
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

function buildQuery(
  params: ClientServiceListParams,
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

  return query ? `?${query}` : "";
}

export async function findClientServices(
  clientId: string,
  params: ClientServiceListParams = {},
): Promise<ClientServiceListResponse> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services${buildQuery(params)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return parseResponse<ClientServiceListResponse>(
    response,
  );
}

export async function findClientServiceById(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services/${serviceId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return parseResponse<ClientService>(
    response,
  );
}

export async function createClientService(
  clientId: string,
  payload: CreateClientServicePayload,
): Promise<ClientService> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<ClientService>(
    response,
  );
}

export async function updateClientService(
  clientId: string,
  serviceId: string,
  payload: UpdateClientServicePayload,
): Promise<ClientService> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services/${serviceId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<ClientService>(
    response,
  );
}

export async function enableClientService(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services/${serviceId}/enable`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  return parseResponse<ClientService>(
    response,
  );
}

export async function disableClientService(
  clientId: string,
  serviceId: string,
): Promise<ClientService> {
  const response = await fetch(
    `${API_BASE}/clients/${clientId}/services/${serviceId}/disable`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  return parseResponse<ClientService>(
    response,
  );
}