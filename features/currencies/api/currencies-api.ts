"use client";

import type {
  CreateCurrencyPayload,
  Currency,
  CurrencyListParams,
  CurrencyListResponse,
  UpdateCurrencyPayload,
} from "@/features/currencies/types/currency.types";

interface CurrencyApiResponse {
  success: true;
  data: Currency;
}

interface CurrencyListApiResponse {
  success: true;
  data: {
    data: Currency[];
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

export class CurrenciesApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "CurrenciesApiError";

    this.status = status;
  }
}

function getErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return fallback;
  }

  const value =
    body as Record<
      string,
      unknown
    >;

  if (
    typeof value.message ===
    "string"
  ) {
    return value.message;
  }

  if (
    Array.isArray(value.message)
  ) {
    const messages =
      value.message.filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (
    typeof value.error ===
    "object" &&
    value.error !== null
  ) {
    const error =
      value.error as Record<
        string,
        unknown
      >;

    if (
      typeof error.message ===
      "string"
    ) {
      return error.message;
    }
  }

  return fallback;
}

async function parseJson(
  response: Response,
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isCurrency(
  value: unknown,
): value is Currency {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const currency =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof currency.id ===
    "string" &&
    typeof currency.code ===
    "string" &&
    (
      currency.numericCode ===
      null ||
      typeof currency.numericCode ===
      "string"
    ) &&
    typeof currency.name ===
    "string" &&
    (
      currency.symbol === null ||
      typeof currency.symbol ===
      "string"
    ) &&
    typeof currency.decimalDigits ===
    "number" &&
    typeof currency.active ===
    "boolean" &&
    typeof currency.createdAt ===
    "string" &&
    typeof currency.updatedAt ===
    "string"
  );
}

function isCurrencyResponse(
  value: unknown,
): value is CurrencyApiResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const body =
    value as Record<
      string,
      unknown
    >;

  return (
    body.success === true &&
    isCurrency(body.data)
  );
}

function isCurrencyListResponse(
  value: unknown,
): value is CurrencyListApiResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const body =
    value as Record<
      string,
      unknown
    >;

  if (
    body.success !== true ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    return false;
  }

  const data =
    body.data as Record<
      string,
      unknown
    >;

  if (
    !Array.isArray(data.data) ||
    !data.data.every(isCurrency)
  ) {
    return false;
  }

  if (
    typeof data.pagination !==
    "object" ||
    data.pagination === null
  ) {
    return false;
  }

  const pagination =
    data.pagination as Record<
      string,
      unknown
    >;

  return (
    typeof pagination.page ===
    "number" &&
    typeof pagination.pageSize ===
    "number" &&
    typeof pagination.totalItems ===
    "number" &&
    typeof pagination.totalPages ===
    "number" &&
    typeof pagination.hasNext ===
    "boolean" &&
    typeof pagination.hasPrevious ===
    "boolean"
  );
}

// ============================================================================
// Find currencies
// ============================================================================

export async function findCurrencies(
  params: CurrencyListParams = {},
): Promise<CurrencyListResponse> {
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

  if (
    params.active !== undefined
  ) {
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

  const response =
    await fetch(
      `/api/currencies?${searchParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

  const body =
    await parseJson(response);

  if (!response.ok) {
    throw new CurrenciesApiError(
      getErrorMessage(
        body,
        "Unable to load currencies.",
      ),
      response.status,
    );
  }

  if (
    !isCurrencyListResponse(body)
  ) {
    throw new CurrenciesApiError(
      "Invalid currencies response.",
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
// Find currency
// ============================================================================

export async function findCurrencyById(
  id: string,
): Promise<Currency> {
  const response =
    await fetch(
      `/api/currencies/${encodeURIComponent(id)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

  const body =
    await parseJson(response);

  if (!response.ok) {
    throw new CurrenciesApiError(
      getErrorMessage(
        body,
        "Unable to load currency.",
      ),
      response.status,
    );
  }

  if (
    !isCurrencyResponse(body)
  ) {
    throw new CurrenciesApiError(
      "Invalid currency response.",
      response.status,
    );
  }

  return body.data;
}

// ============================================================================
// Create currency
// ============================================================================

export async function createCurrency(
  input: CreateCurrencyPayload,
): Promise<Currency> {
  return mutateCurrency(
    "/api/currencies",
    "POST",
    input,
    "Unable to create currency.",
  );
}

// ============================================================================
// Update currency
// ============================================================================

export async function updateCurrency(
  id: string,
  input: UpdateCurrencyPayload,
): Promise<Currency> {
  return mutateCurrency(
    `/api/currencies/${encodeURIComponent(id)}`,
    "PATCH",
    input,
    "Unable to update currency.",
  );
}

// ============================================================================
// Enable currency
// ============================================================================

export async function enableCurrency(
  id: string,
): Promise<Currency> {
  return mutateCurrency(
    `/api/currencies/${encodeURIComponent(id)}/enable`,
    "PATCH",
    undefined,
    "Unable to enable currency.",
  );
}

// ============================================================================
// Disable currency
// ============================================================================

export async function disableCurrency(
  id: string,
): Promise<Currency> {
  return mutateCurrency(
    `/api/currencies/${encodeURIComponent(id)}/disable`,
    "PATCH",
    undefined,
    "Unable to disable currency.",
  );
}

// ============================================================================
// Shared mutation helper
// ============================================================================

async function mutateCurrency(
  path: string,
  method: "POST" | "PATCH",
  input: unknown,
  fallbackMessage: string,
): Promise<Currency> {
  const headers: HeadersInit = {};

  let body:
    | string
    | undefined;

  if (input !== undefined) {
    headers["Content-Type"] =
      "application/json";

    body = JSON.stringify(input);
  }

  const response =
    await fetch(path, {
      method,
      headers,
      body,
      cache: "no-store",
    });

  const responseBody =
    await parseJson(response);

  if (!response.ok) {
    throw new CurrenciesApiError(
      getErrorMessage(
        responseBody,
        fallbackMessage,
      ),
      response.status,
    );
  }

  if (
    !isCurrencyResponse(
      responseBody,
    )
  ) {
    throw new CurrenciesApiError(
      "Invalid currency response.",
      response.status,
    );
  }

  return responseBody.data;
}