import type {
  CountryCurrency,
  CountryCurrencyListParams,
  CountryCurrencyListResponse,
  CreateCountryCurrencyPayload,
  UpdateCountryCurrencyPayload,
} from "@/features/country-currencies/types/country-currency.types";

export class CountryCurrenciesApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CountryCurrenciesApiError";
  }
}

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

function isCountryCurrencyListResponse(
  value: unknown,
): value is CountryCurrencyListResponse {
  if (!isRecord(value)) {
    return false;
  }

  const items = value.items;
  const meta = value.meta;

  if (!Array.isArray(items) || !isRecord(meta)) {
    return false;
  }

  return (
    items.every(isCountryCurrency) &&
    typeof meta.page === "number" &&
    typeof meta.pageSize === "number" &&
    typeof meta.total === "number" &&
    typeof meta.totalPages === "number"
  );
}

function extractData(
  value: unknown,
): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (
    value.success === true &&
    "data" in value
  ) {
    return value.data;
  }

  return value;
}

async function parseResponse(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType.includes("application/json")
  ) {
    return null;
  }

  return response.json();
}

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

async function request<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new CountryCurrenciesApiError(
      error instanceof Error
        ? error.message
        : "Unable to connect to the Country Currencies API.",
    );
  }

  const body = await parseResponse(response);

  if (!response.ok) {
    throw new CountryCurrenciesApiError(
      extractErrorMessage(
        body,
        `Country Currencies API request failed with status ${response.status}.`,
      ),
      response.status,
    );
  }

  return body as T;
}

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

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function findCountryCurrencies(
  params: CountryCurrencyListParams = {},
): Promise<CountryCurrencyListResponse> {
  const response = await request<unknown>(
    `/api/country-currencies${buildQueryString(params)}`,
  );

  const data = extractData(response);

  if (
    !isRecord(data) ||
    !isCountryCurrencyListResponse(data)
  ) {
    throw new CountryCurrenciesApiError(
      "Invalid country currency list response.",
    );
  }

  return data;
}

export async function findCountryCurrency(
  countryCode: string,
  currencyId: string,
): Promise<CountryCurrency> {
  const response = await request<unknown>(
    `/api/country-currencies/${encodeURIComponent(
      countryCode,
    )}/${encodeURIComponent(currencyId)}`,
  );

  const data = extractData(response);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

export async function createCountryCurrency(
  payload: CreateCountryCurrencyPayload,
): Promise<CountryCurrency> {
  const response = await request<unknown>(
    "/api/country-currencies",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  const data = extractData(response);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

export async function updateCountryCurrency(
  countryCode: string,
  currencyId: string,
  payload: UpdateCountryCurrencyPayload,
): Promise<CountryCurrency> {
  const response = await request<unknown>(
    `/api/country-currencies/${encodeURIComponent(
      countryCode,
    )}/${encodeURIComponent(currencyId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  const data = extractData(response);

  if (!isCountryCurrency(data)) {
    throw new CountryCurrenciesApiError(
      "Invalid country currency response.",
    );
  }

  return data;
}

export async function deleteCountryCurrency(
  countryCode: string,
  currencyId: string,
): Promise<void> {
  await request<unknown>(
    `/api/country-currencies/${encodeURIComponent(
      countryCode,
    )}/${encodeURIComponent(currencyId)}`,
    {
      method: "DELETE",
    },
  );
}