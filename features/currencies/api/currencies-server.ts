import {
  cookies,
} from "next/headers";

import type {
  CreateCurrencyPayload,
  Currency,
  CurrencyListParams,
  CurrencyListResponse,
  UpdateCurrencyPayload,
} from "../types/currency.types";

interface CurrenciesListData {
  items: Currency[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface CurrenciesListEnvelope {
  success: true;
  data: CurrenciesListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

interface CurrencyResponseEnvelope {
  success: true;
  data: Currency;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export class CurrenciesApiError
  extends Error {
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

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new CurrenciesApiError(
      "CONTROL_PLANE_API_URL is not configured.",
      500,
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

async function getSessionCookie() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new CurrenciesApiError(
      "Authentication required.",
      401,
    );
  }

  return session;
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

function isCurrenciesListEnvelope(
  value: unknown,
): value is CurrenciesListEnvelope {
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
    !Array.isArray(data.items) ||
    !data.items.every(isCurrency)
  ) {
    return false;
  }

  return (
    typeof data.page ===
    "number" &&
    typeof data.pageSize ===
    "number" &&
    typeof data.totalItems ===
    "number" &&
    typeof data.totalPages ===
    "number" &&
    typeof data.hasNext ===
    "boolean" &&
    typeof data.hasPrevious ===
    "boolean"
  );
}

function isCurrencyResponseEnvelope(
  value: unknown,
): value is CurrencyResponseEnvelope {
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

async function parseResponseBody(
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

function getErrorMessage(
  body: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return fallbackMessage;
  }

  const value =
    body as Record<
      string,
      unknown
    >;

  if (
    typeof value.message ===
    "string" &&
    value.message.trim()
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

  return fallbackMessage;
}

// ============================================================================
// Find currencies
// ============================================================================

export async function findCurrencies(
  params: CurrencyListParams = {},
): Promise<CurrencyListResponse> {
  const session =
    await getSessionCookie();

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

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/currencies?${searchParams.toString()}`,
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
      "[Currencies] Failed to connect to Control Plane.",
      error,
    );

    throw new CurrenciesApiError(
      "Unable to connect to the currency API.",
      502,
    );
  }

  const body =
    await parseResponseBody(
      response,
    );

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
    !isCurrenciesListEnvelope(body)
  ) {
    throw new CurrenciesApiError(
      "Invalid currencies response.",
      response.status,
    );
  }

  return {
    items: body.data.items,
    meta: {
      page:
        body.data.page,
      pageSize:
        body.data.pageSize,
      total:
        body.data.totalItems,
      totalPages:
        body.data.totalPages,
    },
  };
}

// ============================================================================
// Find currency by ID
// ============================================================================

export async function findCurrencyById(
  id: string,
): Promise<Currency> {
  const session =
    await getSessionCookie();

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/currencies/${encodeURIComponent(id)}`,
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
      "[Currencies] Failed to connect to Control Plane.",
      error,
    );

    throw new CurrenciesApiError(
      "Unable to connect to the currency API.",
      502,
    );
  }

  return parseCurrencyResponse(
    response,
    "Unable to load currency.",
  );
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
  const session =
    await getSessionCookie();

  const headers: HeadersInit = {
    Cookie:
      `${session.name}=${session.value}`,
  };

  let body:
    | string
    | undefined;

  if (input !== undefined) {
    headers["Content-Type"] =
      "application/json";

    body =
      JSON.stringify(input);
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
      "[Currencies] Failed to connect to Control Plane.",
      error,
    );

    throw new CurrenciesApiError(
      "Unable to connect to the currency API.",
      502,
    );
  }

  return parseCurrencyResponse(
    response,
    fallbackMessage,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

async function parseCurrencyResponse(
  response: Response,
  fallbackMessage: string,
): Promise<Currency> {
  const body =
    await parseResponseBody(
      response,
    );

  if (!response.ok) {
    throw new CurrenciesApiError(
      getErrorMessage(
        body,
        fallbackMessage,
      ),
      response.status,
    );
  }

  if (
    !isCurrencyResponseEnvelope(
      body,
    )
  ) {
    throw new CurrenciesApiError(
      "Invalid currency response.",
      response.status,
    );
  }

  return body.data;
}