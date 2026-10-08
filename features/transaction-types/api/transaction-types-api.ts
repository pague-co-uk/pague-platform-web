import type {
  CreateTransactionTypePayload,
  TransactionType,
  TransactionTypeListParams,
  TransactionTypeListResponse,
  UpdateTransactionTypePayload,
} from "@/features/transaction-types/types/transaction-type.types";

interface ApiErrorBody {
  success?: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

interface CollectionResponseBody {
  success: true;
  data: {
    data: TransactionType[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

interface ItemResponseBody {
  success: true;
  data: TransactionType;
}

export class TransactionTypesApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "TransactionTypesApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isCollectionResponse(
  value: unknown,
): value is CollectionResponseBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  if (body.success !== true) {
    return false;
  }

  if (!body.data || typeof body.data !== "object") {
    return false;
  }

  const data = body.data as Record<string, unknown>;

  return (
    Array.isArray(data.data) &&
    !!data.pagination &&
    typeof data.pagination === "object"
  );
}

function isItemResponse(
  value: unknown,
): value is ItemResponseBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    body.success === true &&
    !!body.data &&
    typeof body.data === "object"
  );
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;

    throw new TransactionTypesApiError(
      errorBody?.error?.message ??
      `Transaction Types API request failed with status ${response.status}.`,
      response.status,
      errorBody?.error?.code,
      errorBody?.error?.details,
    );
  }

  return body as T;
}

function buildQuery(
  params: TransactionTypeListParams = {},
): string {
  const searchParams = new URLSearchParams();

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

  if (params.active !== undefined) {
    searchParams.set(
      "active",
      String(params.active),
    );
  }

  if (params.sort) {
    searchParams.set(
      "sort",
      params.sort,
    );
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function findTransactionTypes(
  params: TransactionTypeListParams = {},
): Promise<TransactionTypeListResponse> {
  const response = await fetch(
    `/api/transaction-types${buildQuery(params)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isCollectionResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction types collection response.",
      response.status,
    );
  }

  return {
    items: body.data.data,
    meta: {
      page: body.data.pagination.page,
      pageSize:
        body.data.pagination.pageSize,
      total:
        body.data.pagination.totalItems,
      totalPages:
        body.data.pagination.totalPages,
    },
  };
}

export async function findTransactionTypeById(
  id: string,
): Promise<TransactionType> {
  const response = await fetch(
    `/api/transaction-types/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isItemResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data;
}

export async function createTransactionType(
  payload: CreateTransactionTypePayload,
): Promise<TransactionType> {
  const response = await fetch(
    "/api/transaction-types",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isItemResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data;
}

export async function updateTransactionType(
  id: string,
  payload: UpdateTransactionTypePayload,
): Promise<TransactionType> {
  const response = await fetch(
    `/api/transaction-types/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isItemResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data;
}

export async function enableTransactionType(
  id: string,
): Promise<TransactionType> {
  const response = await fetch(
    `/api/transaction-types/${encodeURIComponent(id)}/enable`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isItemResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data;
}

export async function disableTransactionType(
  id: string,
): Promise<TransactionType> {
  const response = await fetch(
    `/api/transaction-types/${encodeURIComponent(id)}/disable`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  const body =
    await parseResponse<unknown>(response);

  if (!isItemResponse(body)) {
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data;
}