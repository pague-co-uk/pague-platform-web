import { cookies } from "next/headers";

import type {
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from "../types/transaction";

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
// Error
// ============================================================================

export class TransactionsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "TransactionsApiError";

    this.status = status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Session
// ============================================================================

async function getSessionCookie() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new TransactionsApiError(
      "Authentication required.",
      401,
    );
  }

  return session;
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseResponse<T>(
  response: Response,
): Promise<T> {
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
    throw new TransactionsApiError(
      getTransactionErrorMessage(
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
    body.success !== true ||
    !("data" in body)
  ) {
    throw new TransactionsApiError(
      "The server returned an invalid response.",
      response.status,
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

  const data =
    value.data;

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

  const pagination =
    data.pagination;

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
  options: TransactionListParams,
): string {
  const searchParams =
    new URLSearchParams();

  if (options.page !== undefined) {
    searchParams.set(
      "page",
      String(options.page),
    );
  }

  if (options.pageSize !== undefined) {
    searchParams.set(
      "pageSize",
      String(options.pageSize),
    );
  }

  if (options.search) {
    searchParams.set(
      "search",
      options.search,
    );
  }

  if (options.status) {
    searchParams.set(
      "status",
      options.status,
    );
  }

  if (options.clientId) {
    searchParams.set(
      "clientId",
      options.clientId,
    );
  }

  if (options.clientServiceId) {
    searchParams.set(
      "clientServiceId",
      options.clientServiceId,
    );
  }

  if (options.providerId) {
    searchParams.set(
      "providerId",
      options.providerId,
    );
  }

  if (options.providerServiceId) {
    searchParams.set(
      "providerServiceId",
      options.providerServiceId,
    );
  }

  if (options.currencyId) {
    searchParams.set(
      "currencyId",
      options.currencyId,
    );
  }

  if (options.transactionTypeId) {
    searchParams.set(
      "transactionTypeId",
      options.transactionTypeId,
    );
  }

  if (options.sort) {
    searchParams.set(
      "sort",
      options.sort,
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
//
// Server-side only.
// ============================================================================

export async function findTransactions(
  options: TransactionListParams = {},
): Promise<TransactionListResponse> {
  const session =
    await getSessionCookie();

  const url =
    `${getControlPlaneUrl()}/api/transactions` +
    buildQuery(options);

  let response: Response;

  try {
    response =
      await fetch(url, {
        method: "GET",

        headers: {
          Cookie:
            `${session.name}=${session.value}`,
        },

        cache: "no-store",
      });
  } catch (error) {
    console.error(
      "[Transactions] Failed to connect to Control Plane.",
      error,
    );

    throw new TransactionsApiError(
      "Unable to connect to the transactions service.",
      503,
    );
  }

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
    throw new TransactionsApiError(
      getTransactionErrorMessage(
        body,
        "Unable to load transactions.",
      ),
      response.status,
    );
  }

  if (
    !isTransactionsListEnvelope(body)
  ) {
    throw new TransactionsApiError(
      "Invalid transactions response.",
      response.status,
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
//
// Server-side only.
// ============================================================================

export async function findTransactionById(
  transactionId: string,
): Promise<Transaction> {
  const session =
    await getSessionCookie();

  const url =
    `${getControlPlaneUrl()}/api/transactions/` +
    encodeURIComponent(
      transactionId,
    );

  let response: Response;

  try {
    response =
      await fetch(url, {
        method: "GET",

        headers: {
          Cookie:
            `${session.name}=${session.value}`,
        },

        cache: "no-store",
      });
  } catch (error) {
    console.error(
      "[Transactions] Failed to connect to Control Plane.",
      error,
    );

    throw new TransactionsApiError(
      "Unable to connect to the transactions service.",
      503,
    );
  }

  return parseResponse<Transaction>(
    response,
  );
}