export type ConnectorStatus =
  | "ACTIVE"
  | "DISABLED"
  | "SUSPENDED";

export type ConnectorTransport =
  "HTTP" | "SMPP";

export interface Connector {
  id: string;
  publicId: string;
  name: string;
  code: string;
  provider: string;
  transport: ConnectorTransport;
  status: ConnectorStatus;
  configuration?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FindConnectorsParams {
  page?: number;
  pageSize?: number;
  status?: ConnectorStatus;
  transport?: ConnectorTransport;
  provider?: string;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindConnectorsResult {
  items: Connector[];
  meta: PaginationMeta;
}

export interface CreateConnectorInput {
  publicId: string;
  name: string;
  code: string;
  provider: string;
  transport: ConnectorTransport;
  configuration?: Record<string, unknown>;
}

export interface UpdateConnectorInput {
  name?: string;
  code?: string;
  provider?: string;
  transport?: ConnectorTransport;
  configuration?: Record<string, unknown>;
}

export class ConnectorsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ConnectorsApiError";

    this.status =
      status;
  }
}

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

function getConnectorErrorMessage(
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

async function parseResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ConnectorsApiError(
      getConnectorErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  return body as T;
}

/* -------------------------------------------------------------------------- */
/* Connectors                                                                 */
/* -------------------------------------------------------------------------- */

export async function findConnectors(
  params: FindConnectorsParams = {},
): Promise<FindConnectorsResult> {
  const response =
    await fetch(
      `/api/connectors${buildQueryString(params)}`,
      {
        method: "GET",
        credentials: "include",
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

export async function findConnectorById(
  id: string,
): Promise<Connector> {
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "GET",
        credentials: "include",
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
  const response =
    await fetch(
      "/api/connectors",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
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
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
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
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const body =
      (await response
        .json()
        .catch(() => null)) as unknown;

    throw new ConnectorsApiError(
      getConnectorErrorMessage(
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
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        credentials: "include",
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
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
        credentials: "include",
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
  const response =
    await fetch(
      `/api/connectors/${encodeURIComponent(id)}/suspend`,
      {
        method: "POST",
        credentials: "include",
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