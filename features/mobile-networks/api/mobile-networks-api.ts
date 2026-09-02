export type MobileNetworkStatus =
  | "ACTIVE"
  | "DISABLED";

export interface MobileNetworkPrefix {
  id: string;
  mobileNetworkId: string;
  prefix: string;
  countryCode: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MobileNetwork {
  id: string;
  publicId: string;
  name: string;
  code: string;
  countryCode: string;
  status: MobileNetworkStatus;
  prefixes: MobileNetworkPrefix[];
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

export interface FindMobileNetworkPrefixesParams {
  page?: number;
  pageSize?: number;
}

export interface FindMobileNetworkPrefixesResult {
  items: MobileNetworkPrefix[];
  meta: PaginationMeta;
}

export interface CreateMobileNetworkInput {
  publicId: string;
  name: string;
  code: string;
  countryCode: string;
}

export interface UpdateMobileNetworkInput {
  name?: string;
  code?: string;
  countryCode?: string;
}

export interface CreateMobileNetworkPrefixInput {
  prefix: string;
  countryCode: string;
  enabled?: boolean;
}

export interface UpdateMobileNetworkPrefixInput {
  prefix?: string;
  countryCode?: string;
  enabled?: boolean;
}

export class MobileNetworksApiError extends Error {
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

interface PaginatedMobileNetworkPrefixesResponse {
  success: boolean;
  data: MobileNetworkPrefix[];
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

function buildPrefixQueryString(
  params: FindMobileNetworkPrefixesParams = {},
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

/* -------------------------------------------------------------------------- */
/* Mobile Network Prefixes                                                    */
/* -------------------------------------------------------------------------- */

export async function findMobileNetworkPrefixes(
  id: string,
  params: FindMobileNetworkPrefixesParams = {},
): Promise<FindMobileNetworkPrefixesResult> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes${buildPrefixQueryString(params)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedMobileNetworkPrefixesResponse>(
      response,
      "Unable to retrieve mobile network prefixes.",
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

export async function findMobileNetworkPrefixById(
  id: string,
  prefixId: string,
): Promise<MobileNetworkPrefix> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: MobileNetworkPrefix;
    }>(
      response,
      "Unable to retrieve mobile network prefix.",
    );

  return body.data;
}

export async function createMobileNetworkPrefix(
  id: string,
  input: CreateMobileNetworkPrefixInput,
): Promise<MobileNetworkPrefix> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes`,
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
      data: MobileNetworkPrefix;
    }>(
      response,
      "Unable to create mobile network prefix.",
    );

  return body.data;
}

export async function updateMobileNetworkPrefix(
  id: string,
  prefixId: string,
  input: UpdateMobileNetworkPrefixInput,
): Promise<MobileNetworkPrefix> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
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
      data: MobileNetworkPrefix;
    }>(
      response,
      "Unable to update mobile network prefix.",
    );

  return body.data;
}

export async function deleteMobileNetworkPrefix(
  id: string,
  prefixId: string,
): Promise<void> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
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
        "Unable to delete mobile network prefix.",
      ),
      response.status,
    );
  }
}

export async function enableMobileNetworkPrefix(
  id: string,
  prefixId: string,
): Promise<MobileNetworkPrefix> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}/enable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: MobileNetworkPrefix;
    }>(
      response,
      "Unable to enable mobile network prefix.",
    );

  return body.data;
}

export async function disableMobileNetworkPrefix(
  id: string,
  prefixId: string,
): Promise<MobileNetworkPrefix> {
  const response =
    await fetch(
      `/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}/disable`,
      {
        method: "POST",
        credentials: "include",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: MobileNetworkPrefix;
    }>(
      response,
      "Unable to disable mobile network prefix.",
    );

  return body.data;
}