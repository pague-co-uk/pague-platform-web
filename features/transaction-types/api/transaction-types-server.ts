import { cookies } from "next/headers";

import type {
  CreateTransactionTypePayload,
  TransactionType,
  TransactionTypeListParams,
  TransactionTypeListResponse,
  UpdateTransactionTypePayload,
} from "../types/transaction-type.types";

interface TransactionTypesPaginationResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface TransactionTypesListData {
  data: TransactionType[];
  pagination: TransactionTypesPaginationResponse;
}

interface TransactionTypesListEnvelope {
  success: true;
  data: TransactionTypesListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export class TransactionTypesApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "TransactionTypesApiError";

    this.status = status;
  }
}

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new TransactionTypesApiError(
      "CONTROL_PLANE_API_URL is not configured.",
      500,
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Find transaction types
// ============================================================================

export async function findTransactionTypes(
  params: TransactionTypeListParams = {},
): Promise<TransactionTypeListResponse> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new TransactionTypesApiError(
      "Authentication required.",
      401,
    );
  }

  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "pageSize",
    String(params.pageSize ?? 20),
  );

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

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/transaction-types?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie:
            `${session.name}=${session.value}`,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "[Transaction Types] Failed to connect to Control Plane.",
      error,
    );

    throw new TransactionTypesApiError(
      "Unable to connect to the transaction type API.",
      502,
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
    throw new TransactionTypesApiError(
      getTransactionTypeErrorMessage(
        body,
        "Unable to load transaction types.",
      ),
      response.status,
    );
  }

  if (
    !isTransactionTypesListEnvelope(
      body,
    )
  ) {
    throw new TransactionTypesApiError(
      "Invalid transaction types response.",
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
// Find transaction type
// ============================================================================

export async function findTransactionTypeById(
  id: string,
): Promise<TransactionType> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new TransactionTypesApiError(
      "Authentication required.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/transaction-types/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie:
            `${session.name}=${session.value}`,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "[Transaction Types] Failed to connect to Control Plane.",
      error,
    );

    throw new TransactionTypesApiError(
      "Unable to connect to the transaction type API.",
      502,
    );
  }

  return parseTransactionTypeResponse(
    response,
    "Unable to load transaction type.",
  );
}

// ============================================================================
// Create transaction type
// ============================================================================

export async function createTransactionType(
  input: CreateTransactionTypePayload,
): Promise<TransactionType> {
  return mutateTransactionType(
    "/api/transaction-types",
    "POST",
    input,
    "Unable to create transaction type.",
  );
}

// ============================================================================
// Update transaction type
// ============================================================================

export async function updateTransactionType(
  id: string,
  input: UpdateTransactionTypePayload,
): Promise<TransactionType> {
  return mutateTransactionType(
    `/api/transaction-types/${encodeURIComponent(id)}`,
    "PATCH",
    input,
    "Unable to update transaction type.",
  );
}

// ============================================================================
// Enable transaction type
// ============================================================================

export async function enableTransactionType(
  id: string,
): Promise<TransactionType> {
  return mutateTransactionType(
    `/api/transaction-types/${encodeURIComponent(id)}/enable`,
    "PATCH",
    undefined,
    "Unable to enable transaction type.",
  );
}

// ============================================================================
// Disable transaction type
// ============================================================================

export async function disableTransactionType(
  id: string,
): Promise<TransactionType> {
  return mutateTransactionType(
    `/api/transaction-types/${encodeURIComponent(id)}/disable`,
    "PATCH",
    undefined,
    "Unable to disable transaction type.",
  );
}

// ============================================================================
// Shared mutation helper
// ============================================================================

async function mutateTransactionType(
  path: string,
  method: "POST" | "PATCH",
  input: unknown,
  fallbackMessage: string,
): Promise<TransactionType> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new TransactionTypesApiError(
      "Authentication required.",
      401,
    );
  }

  const headers: HeadersInit = {
    Cookie:
      `${session.name}=${session.value}`,
  };

  let body: string | undefined;

  if (input !== undefined) {
    headers["Content-Type"] =
      "application/json";

    body = JSON.stringify(input);
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}${path}`,
      {
        method,
        headers,
        body,
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "[Transaction Types] Failed to connect to Control Plane.",
      error,
    );

    throw new TransactionTypesApiError(
      "Unable to connect to the transaction type API.",
      502,
    );
  }

  return parseTransactionTypeResponse(
    response,
    fallbackMessage,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseTransactionTypeResponse(
  response: Response,
  fallbackMessage: string,
): Promise<TransactionType> {
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
    throw new TransactionTypesApiError(
      getTransactionTypeErrorMessage(
        body,
        fallbackMessage,
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
    throw new TransactionTypesApiError(
      "Invalid transaction type response.",
      response.status,
    );
  }

  return body.data as TransactionType;
}

// ============================================================================
// Response validation
// ============================================================================

function isTransactionTypesListEnvelope(
  value: unknown,
): value is TransactionTypesListEnvelope {
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
    typeof value.data !==
    "object" ||
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
    typeof data.pagination !==
    "object" ||
    data.pagination === null
  ) {
    return false;
  }

  const pagination =
    data.pagination;

  return (
    "page" in pagination &&
    typeof pagination.page ===
    "number" &&

    "pageSize" in pagination &&
    typeof pagination.pageSize ===
    "number" &&

    "totalItems" in pagination &&
    typeof pagination.totalItems ===
    "number" &&

    "totalPages" in pagination &&
    typeof pagination.totalPages ===
    "number" &&

    "hasNext" in pagination &&
    typeof pagination.hasNext ===
    "boolean" &&

    "hasPrevious" in pagination &&
    typeof pagination.hasPrevious ===
    "boolean"
  );
}

// ============================================================================
// Error extraction
// ============================================================================

function getTransactionTypeErrorMessage(
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
    body as Record<
      string,
      unknown
    >;

  if (
    typeof response.message ===
    "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  if (
    typeof response.error ===
    "object" &&
    response.error !== null
  ) {
    const error =
      response.error as Record<
        string,
        unknown
      >;

    if (
      typeof error.message ===
      "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      typeof error.detail ===
      "string" &&
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
          typeof value ===
          "string",
      );

    if (messages.length > 0) {
      return messages.join(
        ", ",
      );
    }
  }

  return fallbackMessage;
}