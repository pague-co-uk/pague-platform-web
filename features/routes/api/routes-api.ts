import type {
  ConnectorTransport,
} from "@/features/connectors/api/connectors-api";

export type RouteStatus =
  | "ACTIVE"
  | "DISABLED";

export interface RouteClient {
  id: string;
  companyName: string;
  displayName: string;
}

export interface RouteMobileNetwork {
  id: string;
  name: string;
  code: string;
  countryCode: string;
  status: string;
}

export interface RouteConnector {
  id: string;
  name: string;
  code: string;
  provider: string;
  transport: ConnectorTransport;
  status: string;
}

export interface Route {
  id: string;
  publicId: string;
  clientId: string;
  client?: RouteClient;
  mobileNetworkId: string;
  mobileNetwork?: RouteMobileNetwork;
  connectorId: string;
  connector?: RouteConnector;
  priority: number;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindRoutesParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  mobileNetworkId?: string;
  connectorId?: string;
  status?: RouteStatus;
  search?: string;
}

export interface FindRoutesResult {
  items: Route[];
  meta: PaginationMeta;
}

export interface CreateRouteInput {
  publicId: string;
  clientId: string;
  mobileNetworkId: string;
  connectorId: string;
  priority: number;
}

export interface UpdateRouteInput {
  clientId?: string;
  mobileNetworkId?: string;
  connectorId?: string;
  priority?: number;
}

export class RoutesApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "RoutesApiError";

    this.status =
      status;
  }
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const error =
      payload as ApiErrorResponse;

    if (
      typeof error.message ===
      "string"
    ) {
      return error.message;
    }

    if (
      typeof error.error ===
      "string"
    ) {
      return error.error;
    }
  }

  return fallback;
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    );

  const hasJson =
    contentType?.includes(
      "application/json",
    ) ?? false;

  const payload =
    hasJson
      ? await response.json()
      : undefined;

  if (!response.ok) {
    throw new RoutesApiError(
      getErrorMessage(
        payload,
        "The request failed.",
      ),
      response.status,
    );
  }

  return payload as T;
}

export async function findRoutes(
  params: FindRoutesParams = {},
): Promise<FindRoutesResult> {
  const searchParams =
    new URLSearchParams();

  if (params.page !== undefined) {
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

  if (params.clientId) {
    searchParams.set(
      "clientId",
      params.clientId,
    );
  }

  if (params.mobileNetworkId) {
    searchParams.set(
      "mobileNetworkId",
      params.mobileNetworkId,
    );
  }

  if (params.connectorId) {
    searchParams.set(
      "connectorId",
      params.connectorId,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await fetch(
      query
        ? `/api/routes?${query}`
        : "/api/routes",
      {
        method: "GET",
      },
    );

  const payload =
    await parseResponse<
      | FindRoutesResult
      | {
        data: FindRoutesResult;
      }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as FindRoutesResult;
}

export async function findRouteById(
  id: string,
): Promise<Route> {
  const response =
    await fetch(
      `/api/routes/${encodeURIComponent(id)}`,
      {
        method: "GET",
      },
    );

  const payload =
    await parseResponse<
      Route | { data: Route }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as Route;
}

export async function createRoute(
  input: CreateRouteInput,
): Promise<Route> {
  const response =
    await fetch(
      "/api/routes",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
      },
    );

  const payload =
    await parseResponse<
      Route | { data: Route }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as Route;
}

export async function updateRoute(
  id: string,
  input: UpdateRouteInput,
): Promise<Route> {
  const response =
    await fetch(
      `/api/routes/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
      },
    );

  const payload =
    await parseResponse<
      Route | { data: Route }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as Route;
}

export async function deleteRoute(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/routes/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );

  if (!response.ok) {
    const contentType =
      response.headers.get(
        "content-type",
      );

    const payload =
      contentType?.includes(
        "application/json",
      )
        ? await response.json()
        : undefined;

    throw new RoutesApiError(
      getErrorMessage(
        payload,
        "Unable to delete route.",
      ),
      response.status,
    );
  }
}

export async function enableRoute(
  id: string,
): Promise<Route> {
  const response =
    await fetch(
      `/api/routes/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
      },
    );

  const payload =
    await parseResponse<
      Route | { data: Route }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as Route;
}

export async function disableRoute(
  id: string,
): Promise<Route> {
  const response =
    await fetch(
      `/api/routes/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
      },
    );

  const payload =
    await parseResponse<
      Route | { data: Route }
    >(response);

  if (
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as Route;
}