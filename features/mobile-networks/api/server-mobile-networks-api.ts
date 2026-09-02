import "server-only";

import { cookies } from "next/headers";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

import type {
  CreateMobileNetworkInput,
  CreateMobileNetworkPrefixInput,
  FindMobileNetworkPrefixesParams,
  FindMobileNetworksParams,
  MobileNetwork,
  MobileNetworkPrefix,
  PaginationMeta,
  UpdateMobileNetworkInput,
  UpdateMobileNetworkPrefixInput,
} from "@/features/mobile-networks/api/mobile-networks-api";

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

export class ServerMobileNetworksApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ServerMobileNetworksApiError";

    this.status =
      status;
  }
}

function getErrorMessage(
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

async function parseResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ServerMobileNetworksApiError(
      getErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  return body as T;
}

async function getCookieHeader(): Promise<string> {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`,
    )
    .join("; ");
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

function normalizePagination(
  pagination:
    | PaginationResponse
    | undefined,
  fallbackCount: number,
  params: {
    page?: number;
    pageSize?: number;
  },
): PaginationMeta {
  if (pagination) {
    return {
      page:
        pagination.page,
      pageSize:
        pagination.pageSize,
      total:
        pagination.totalItems,
      totalPages:
        pagination.totalPages,
    };
  }

  return {
    page:
      params.page ?? 1,
    pageSize:
      params.pageSize ?? 20,
    total:
      fallbackCount,
    totalPages:
      fallbackCount > 0
        ? 1
        : 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Mobile Networks                                                            */
/* -------------------------------------------------------------------------- */

export async function findMobileNetworks(
  params: FindMobileNetworksParams = {},
): Promise<{
  items: MobileNetwork[];
  meta: PaginationMeta;
}> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks${buildQueryString(params)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
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
    meta: normalizePagination(
      pagination,
      body.data.length,
      params,
    ),
  };
}

export async function findMobileNetworkById(
  id: string,
): Promise<MobileNetwork> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks`,
      {
        method: "POST",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const body =
      (await response
        .json()
        .catch(() => null)) as unknown;

    throw new ServerMobileNetworksApiError(
      getErrorMessage(
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/disable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
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
): Promise<{
  items: MobileNetworkPrefix[];
  meta: PaginationMeta;
}> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes${buildPrefixQueryString(params)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
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
    meta: normalizePagination(
      pagination,
      body.data.length,
      params,
    ),
  };
}

export async function findMobileNetworkPrefixById(
  id: string,
  prefixId: string,
): Promise<MobileNetworkPrefix> {
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
      {
        method: "GET",
        headers: {
          cookie,
        },
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes`,
      {
        method: "POST",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
      {
        method: "PUT",
        headers: {
          cookie,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          input,
        ),
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}`,
      {
        method: "DELETE",
        headers: {
          cookie,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const body =
      (await response
        .json()
        .catch(() => null)) as unknown;

    throw new ServerMobileNetworksApiError(
      getErrorMessage(
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}/enable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
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
  const cookie =
    await getCookieHeader();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}/disable`,
      {
        method: "POST",
        headers: {
          cookie,
        },
        cache: "no-store",
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