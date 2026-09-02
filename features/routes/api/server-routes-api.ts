import "server-only";

import { getControlPlaneUrl } from "@/lib/control-plane";
import {
  cookies,
} from "next/headers";
import { FindRoutesParams, FindRoutesResult, Route } from "./routes-api";


interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface PaginatedRoutesResponse {
  success: boolean;
  data: Route[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

interface RouteResponse {
  success: boolean;
  data: Route;
}

function getRouteErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    typeof body === "object" &&
    body !== null
  ) {
    const error =
      body as ApiErrorResponse;

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
  fallback: string,
): Promise<T> {
  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(
      getRouteErrorMessage(
        body,
        fallback,
      ),
    );
  }

  return body as T;
}

function buildQueryString(
  params: FindRoutesParams = {},
): string {
  const searchParams =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !== undefined
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

  return query
    ? `?${query}`
    : "";
}

async function getCookieHeader(): Promise<string> {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`,
    )
    .join("; ");
}

export async function findRoutes(
  params: FindRoutesParams = {},
): Promise<FindRoutesResult> {
  const cookieHeader =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/routes${buildQueryString(params)}`,
      {
        method: "GET",
        headers: {
          ...(cookieHeader
            ? {
              Cookie:
                cookieHeader,
            }
            : {}),
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedRoutesResponse>(
      response,
      "Unable to retrieve routes.",
    );

  const pagination =
    body.pagination ??
    body.meta;

  return {
    items:
      body.data,

    meta: pagination
      ? {
        page:
          pagination.page,
        pageSize:
          pagination.pageSize,
        total:
          pagination.totalItems,
        totalPages:
          pagination.totalPages,
      }
      : {
        page:
          params.page ?? 1,
        pageSize:
          params.pageSize ?? 20,
        total:
          body.data.length,
        totalPages:
          body.data.length > 0
            ? 1
            : 0,
      },
  };
}

export async function findRouteById(
  id: string,
): Promise<Route> {
  const cookieHeader =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/routes/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          ...(cookieHeader
            ? {
              Cookie:
                cookieHeader,
            }
            : {}),
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<RouteResponse>(
      response,
      "Unable to retrieve route.",
    );

  return body.data;
}