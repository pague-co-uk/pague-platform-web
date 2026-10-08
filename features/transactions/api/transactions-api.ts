import type {
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from "../types/transaction";

const API_BASE = "/api";

// ============================================================================
// Control Plane response types
// ============================================================================

interface TransactionsPaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface TransactionsListData {
  data: Transaction[];
  pagination: TransactionsPaginationResponse;
}

interface TransactionsListEnvelope {
  success: true;
  data: TransactionsListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getTransactionErrorMessage(
        body,
        "An unexpected error occurred.",
      ),
    );
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

// ============================================================================
// Response validation
// ============================================================================

function isTransactionsListEnvelope(
  value: unknown,
): value is TransactionsListEnvelope {
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

  const data = value.data;

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

  const pagination = data.pagination;

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

function getTransactionErrorMessage(
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

// ============================================================================
// Query
// ============================================================================

function buildQuery(
  params: TransactionListParams,
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

  if (params.clientId) {
    searchParams.set(
      "clientId",
      params.clientId,
    );
  }

  if (params.clientServiceId) {
    searchParams.set(
      "clientServiceId",
      params.clientServiceId,
    );
  }

  if (params.providerId) {
    searchParams.set(
      "providerId",
      params.providerId,
    );
  }

  if (params.providerServiceId) {
    searchParams.set(
      "providerServiceId",
      params.providerServiceId,
    );
  }

  if (params.currencyId) {
    searchParams.set(
      "currencyId",
      params.currencyId,
    );
  }

  if (params.transactionTypeId) {
    searchParams.set(
      "transactionTypeId",
      params.transactionTypeId,
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

  return query
    ? `?${query}`
    : "";
}

// ============================================================================
// Find transactions
// ============================================================================

export async function findTransactions(
  params: TransactionListParams = {},
): Promise<TransactionListResponse> {
  const response =
    await fetch(
      `${API_BASE}/transactions${buildQuery(
        params,
      )}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getTransactionErrorMessage(
        body,
        "Unable to load transactions.",
      ),
    );
  }

  if (
    !isTransactionsListEnvelope(
      body,
    )
  ) {
    throw new Error(
      "Invalid transactions response.",
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
// Find transaction
// ============================================================================

export async function findTransactionById(
  transactionId: string,
): Promise<Transaction> {
  const response =
    await fetch(
      `${API_BASE}/transactions/${encodeURIComponent(
        transactionId,
      )}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

  return parseResponse<Transaction>(
    response,
  );
}