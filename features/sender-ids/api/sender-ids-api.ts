
export type SenderIdStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DISABLED";

export interface SenderId {
  id: string;
  publicId: string;
  clientId: string;

  client: {
    id: string;
    companyName: string;
    displayName: string;
  };

  sender: string;
  status: SenderIdStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FindSenderIdsParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  status?: SenderIdStatus;
  sender?: string;
  search?: string;
  isDefault?: boolean;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindSenderIdsResult {
  items: SenderId[];
  meta: PaginationMeta;
}

export interface CreateSenderIdInput {
  publicId: string;
  clientId: string;
  sender: string;
}

export interface UpdateSenderIdInput {
  sender?: string;
}

export class SenderIdsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "SenderIdsApiError";

    this.status =
      status;
  }
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface PaginatedSenderIdsResponse {
  success: boolean;
  data: SenderId[];
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

function getSenderIdErrorMessage(
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
  params: FindSenderIdsParams = {},
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

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.sender) {
    searchParams.set(
      "sender",
      params.sender,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (
    params.isDefault !== undefined
  ) {
    searchParams.set(
      "isDefault",
      String(params.isDefault),
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
    throw new SenderIdsApiError(
      getSenderIdErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  return body as T;
}

export async function findSenderIds(
  params: FindSenderIdsParams = {},
): Promise<FindSenderIdsResult> {
  const response =
    await fetch(
      `/api/sender-ids${buildQueryString(params)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedSenderIdsResponse>(
      response,
      "Unable to retrieve Sender IDs.",
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

export async function findSenderIdById(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to retrieve Sender ID.",
    );

  return body.data;
}

export async function createSenderId(
  input: CreateSenderIdInput,
): Promise<SenderId> {
  const response =
    await fetch(
      "/api/sender-ids",
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
      data: SenderId;
    }>(
      response,
      "Unable to create Sender ID.",
    );

  return body.data;
}

export async function updateSenderId(
  id: string,
  input: UpdateSenderIdInput,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}`,
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
      data: SenderId;
    }>(
      response,
      "Unable to update Sender ID.",
    );

  return body.data;
}

export async function deleteSenderId(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}`,
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

    throw new SenderIdsApiError(
      getSenderIdErrorMessage(
        body,
        "Unable to delete Sender ID.",
      ),
      response.status,
    );
  }
}

export async function approveSenderId(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}/approve`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to approve Sender ID.",
    );

  return body.data;
}

export async function rejectSenderId(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}/reject`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to reject Sender ID.",
    );

  return body.data;
}

export async function disableSenderId(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to disable Sender ID.",
    );

  return body.data;
}

export async function enableSenderId(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to enable Sender ID.",
    );

  return body.data;
}


export async function setDefaultSenderId(
  id: string,
): Promise<SenderId> {
  const response =
    await fetch(
      `/api/sender-ids/${encodeURIComponent(id)}/default`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: SenderId;
    }>(
      response,
      "Unable to set default Sender ID.",
    );

  return body.data;
}