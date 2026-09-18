export type MobileNetworkStatus =
  | "ACTIVE"
  | "DISABLED";

export interface Country {
  code: string;
  name: string;
  callingCodes: string[];
}
export interface MobileNetwork {
  id: string;

  publicId: string;

  name: string;

  code: string;

  countryCode: string;

  country: {
    code: string;
    name: string;
  };

  routingRegex: string | null;

  status: MobileNetworkStatus;

  createdAt: string;

  updatedAt: string;
}

export interface FindMobileNetworksParams {
  page?: number;

  pageSize?: number;

  status?: MobileNetworkStatus;

  countryCode?: string;

  search?: string;
}

export interface PaginationMeta {
  page: number;

  pageSize: number;

  total: number;

  totalPages: number;
}

export interface FindMobileNetworksResult {
  items: MobileNetwork[];

  meta: PaginationMeta;
}

export interface CreateMobileNetworkInput {
  publicId: string;

  name: string;

  code: string;

  countryCode: string;

  routingRegex?: string | null;
}

export interface UpdateMobileNetworkInput {
  name?: string;

  code?: string;

  countryCode?: string;

  routingRegex?: string | null;
}

export class MobileNetworksApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "MobileNetworksApiError";

    this.status =
      status;
  }
}

export class CountriesApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "CountriesApiError";

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

interface PaginatedMobileNetworksResponse {
  success: boolean;

  data: MobileNetwork[];

  pagination?: PaginationResponse;

  meta?: PaginationResponse;
}

function getMobileNetworkErrorMessage(
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

function getCountryErrorMessage(
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
  params: FindMobileNetworksParams = {},
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

  if (params.countryCode) {
    searchParams.set(
      "countryCode",
      params.countryCode,
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
    throw new MobileNetworksApiError(
      getMobileNetworkErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  return body as T;
}

/* -------------------------------------------------------------------------- */
/* Countries                                                                  */
/* -------------------------------------------------------------------------- */

export async function findCountries(): Promise<
  Country[]
> {
  const response =
    await fetch(
      "/api/countries",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as
    | {
      success: boolean;

      data: Country[];
    }
    | ApiErrorResponse
    | null;

  if (!response.ok) {
    throw new CountriesApiError(
      getCountryErrorMessage(
        body,
        "Unable to retrieve countries.",
      ),
      response.status,
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("data" in body) ||
    !Array.isArray(body.data)
  ) {
    throw new CountriesApiError(
      "Invalid country response.",
      response.status,
    );
  }

  return body.data as Country[];
}

/* -------------------------------------------------------------------------- */
/* Mobile Networks                                                            */
/* -------------------------------------------------------------------------- */

export async function findMobileNetworks(
  params: FindMobileNetworksParams = {},
): Promise<FindMobileNetworksResult> {
  const response =
    await fetch(
      `/api/mobile-networks${buildQueryString(params)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedMobileNetworksResponse>(
      response,
      "Unable to retrieve mobile networks.",
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

export async function findMobileNetworkById(
  id: string,
): Promise<MobileNetwork> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;

      data: MobileNetwork;
    }>(
      response,
      "Unable to retrieve mobile network.",
    );

  return body.data;
}

export async function createMobileNetwork(
  input: CreateMobileNetworkInput,
): Promise<MobileNetwork> {
  const response =
    await fetch(
      "/api/mobile-networks",
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

      data: MobileNetwork;
    }>(
      response,
      "Unable to create mobile network.",
    );

  return body.data;
}

export async function updateMobileNetwork(
  id: string,
  input: UpdateMobileNetworkInput,
): Promise<MobileNetwork> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}`,
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

      data: MobileNetwork;
    }>(
      response,
      "Unable to update mobile network.",
    );

  return body.data;
}

export async function deleteMobileNetwork(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}`,
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

    throw new MobileNetworksApiError(
      getMobileNetworkErrorMessage(
        body,
        "Unable to delete mobile network.",
      ),
      response.status,
    );
  }
}

export async function enableMobileNetwork(
  id: string,
): Promise<MobileNetwork> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;

      data: MobileNetwork;
    }>(
      response,
      "Unable to enable mobile network.",
    );

  return body.data;
}

export async function disableMobileNetwork(
  id: string,
): Promise<MobileNetwork> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;

      data: MobileNetwork;
    }>(
      response,
      "Unable to disable mobile network.",
    );

  return body.data;
}