import "server-only";

import { cookies } from "next/headers";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

import type {
  Connector,
  CreateConnectorInput,
  FindConnectorsParams,
  PaginationMeta,
  UpdateConnectorInput,
} from "@/features/connectors/api/connectors-api";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface PaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface PaginatedConnectorsResponse {
  success: boolean;
  data: Connector[];
  pagination?: PaginationResponse;
  meta?: PaginationResponse;
}

export class ServerConnectorsApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ServerConnectorsApiError";

    this.status =
      status;
  }
}

function getErrorMessage(
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
    throw new ServerConnectorsApiError(
      getErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  return body as T;
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

function buildQueryString(
  params: FindConnectorsParams = {},
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

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.transport) {
    searchParams.set(
      "transport",
      params.transport,
    );
  }

  if (params.provider) {
    searchParams.set(
      "provider",
      params.provider,
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

function normalizePagination(
  pagination:
    | PaginationResponse
    | undefined,
  fallbackCount: number,
  params: {
    page?: number;
    pageSize?: number;
  },
): PaginationMeta {
  if (pagination) {
    return {
      page:
        pagination.page,
      pageSize:
        pagination.pageSize,
      total:
        pagination.totalItems,
      totalPages:
        pagination.totalPages,
    };
  }

  return {
    page:
      params.page ?? 1,
    pageSize:
      params.pageSize ?? 20,
    total:
      fallbackCount,
    totalPages:
      fallbackCount > 0
        ? 1
        : 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Connectors                                                                 */
/* -------------------------------------------------------------------------- */

export async function findConnectors(
  params: FindConnectorsParams = {},
): Promise<{
  items: Connector[];
  meta: PaginationMeta;
}> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors${buildQueryString(params)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedConnectorsResponse>(
      response,
      "Unable to retrieve connectors.",
    );

  const pagination =
    body.pagination ??
    body.meta;

  return {
    items: body.data,
    meta: normalizePagination(
      pagination,
      body.data.length,
      params,
    ),
  };
}

export async function findConnectorById(
  id: string,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to retrieve connector.",
    );

  return body.data;
}

export async function createConnector(
  input: CreateConnectorInput,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors`,
      {
        method: "POST",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to create connector.",
    );

  return body.data;
}

export async function updateConnector(
  id: string,
  input: UpdateConnectorInput,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to update connector.",
    );

  return body.data;
}

export async function deleteConnector(
  id: string,
): Promise<void> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const body =
      (await response
        .json()
        .catch(() => null)) as unknown;

    throw new ServerConnectorsApiError(
      getErrorMessage(
        body,
        "Unable to delete connector.",
      ),
      response.status,
    );
  }
}

export async function enableConnector(
  id: string,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to enable connector.",
    );

  return body.data;
}

export async function disableConnector(
  id: string,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to disable connector.",
    );

  return body.data;
}

export async function suspendConnector(
  id: string,
): Promise<Connector> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}/suspend`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Connector;
    }>(
      response,
      "Unable to suspend connector.",
    );

  return body.data;
}