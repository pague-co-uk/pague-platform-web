import "server-only";

import { cookies } from "next/headers";

import type {
  CountryCurrency,
  CountryCurrencyListParams,
  CountryCurrencyListResponse,
  CreateCountryCurrencyPayload,
  UpdateCountryCurrencyPayload,
} from "@/features/country-currencies/types/country-currency.types";

import { getControlPlaneUrl } from "@/lib/control-plane";

export class CountryCurrenciesServerApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CountryCurrenciesServerApiError";
  }
}

// ============================================================================
// Type guards
// ============================================================================

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isCountryCurrency(
  value: unknown,
): value is CountryCurrency {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.countryCode === "string" &&
    typeof value.countryName === "string" &&
    typeof value.currencyId === "string" &&
    typeof value.currencyCode === "string" &&
    typeof value.currencyName === "string" &&
    typeof value.isPrimary === "boolean" &&
    typeof value.isOfficial === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

interface CountryCurrenciesListData {
  items: CountryCurrency[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface CountryCurrenciesListEnvelope {
  success: true;
  data: CountryCurrenciesListData;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

function isCountryCurrenciesListEnvelope(
  value: unknown,
): value is CountryCurrenciesListEnvelope {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.success !== true ||
    !isRecord(value.data)
  ) {
    return false;
  }

  const data = value.data;

  if (
    !Array.isArray(data.items) ||
    !data.items.every(isCountryCurrency)
  ) {
    return false;
  }

  return (
    typeof data.page === "number" &&
    typeof data.pageSize === "number" &&
    typeof data.totalItems === "number" &&
    typeof data.totalPages === "number" &&
    typeof data.hasNext === "boolean" &&
    typeof data.hasPrevious === "boolean"
  );
}

// ============================================================================
// Error handling
// ============================================================================

function extractErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (isRecord(body)) {
    if (typeof body.message === "string") {
      return body.message;
    }

    if (
      Array.isArray(body.message) &&
      body.message.every(
        (item) => typeof item === "string",
      )
    ) {
      return body.message.join(", ");
    }

    if (
      isRecord(body.error) &&
      typeof body.error.message === "string"
    ) {
      return body.error.message;
    }
  }

  return fallback;
}

// ============================================================================
// Query string
// ============================================================================

function buildQueryString(
  params: CountryCurrencyListParams = {},
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

  if (params.countryCode) {
    searchParams.set(
      "countryCode",
      params.countryCode,
    );
  }

  if (params.currencyId) {
    searchParams.set(
      "currencyId",
      params.currencyId,
    );
  }

  if (params.isPrimary !== undefined) {
    searchParams.set(
      "isPrimary",
      String(params.isPrimary),
    );
  }

  if (params.isOfficial !== undefined) {
    searchParams.set(
      "isOfficial",
      String(params.isOfficial),
    );
  }

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
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

  return query ? `?${query}` : "";
}

// ============================================================================
// Server request
// ============================================================================

async function serverRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session?.value) {
    throw new CountryCurrenciesServerApiError(
      "Authentication session is missing.",
      401,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}${path}`,
      {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: `${session.name}=${session.value}`,
          ...init?.headers,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    throw new CountryCurrenciesServerApiError(
      error instanceof Error
        ? error.message
        : "Unable to connect to the control plane API.",
    );
  }

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  let body: unknown = null;

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      body =
        await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new CountryCurrenciesServerApiError(
      extractErrorMessage(
        body,
        `Control plane API request failed with status ${response.status}.`,
      ),
      response.status,
    );
  }

  return body as T;
}

// ============================================================================
// Envelope data extraction
// ============================================================================

function extractData(
  body: unknown,
): unknown {
  if (!isRecord(body)) {
    return body;
  }

  if (
    body.success === true &&
    "data" in body
  ) {
    return body.data;
  }

  return body;
}

// ============================================================================
// Find country currencies
// ============================================================================

export async function findCountryCurrencies(
  params: CountryCurrencyListParams = {},
): Promise<CountryCurrencyListResponse> {
  const body =
    await serverRequest<unknown>(
      `/api/country-currencies${buildQueryString(params)}`,
    );

  if (
    !isCountryCurrenciesListEnvelope(
      body,
    )
  ) {
    throw new CountryCurrenciesServerApiError(
      "Invalid country currency list response.",
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
// Find country currency
// ============================================================================

export async function findCountryCurrency(
  countryCode: string,
  currencyId: string,
): Promise<CountryCurrency> {
  const body =
    await serverRequest<unknown>(
      `/api/country-currencies/${encodeURIComponent(
        countryCode,
      )}/${encodeURIComponent(
        currencyId,
      )}`,
    );

  const data =
    extractData(body);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesServerApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

// ============================================================================
// Create country currency
// ============================================================================

export async function createCountryCurrency(
  payload: CreateCountryCurrencyPayload,
): Promise<CountryCurrency> {
  const body =
    await serverRequest<unknown>(
      "/api/country-currencies",
      {
        method: "POST",
        body: JSON.stringify(
          payload,
        ),
      },
    );

  const data =
    extractData(body);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesServerApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

// ============================================================================
// Update country currency
// ============================================================================

export async function updateCountryCurrency(
  countryCode: string,
  currencyId: string,
  payload: UpdateCountryCurrencyPayload,
): Promise<CountryCurrency> {
  const body =
    await serverRequest<unknown>(
      `/api/country-currencies/${encodeURIComponent(
        countryCode,
      )}/${encodeURIComponent(
        currencyId,
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          payload,
        ),
      },
    );

  const data =
    extractData(body);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesServerApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

// ============================================================================
// Delete country currency
// ============================================================================

export async function deleteCountryCurrency(
  countryCode: string,
  currencyId: string,
): Promise<void> {
  await serverRequest<unknown>(
    `/api/country-currencies/${encodeURIComponent(
      countryCode,
    )}/${encodeURIComponent(
      currencyId,
    )}`,
    {
      method: "DELETE",
    },
  );
}