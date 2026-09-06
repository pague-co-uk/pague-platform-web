import "server-only";

import { cookies } from "next/headers";

import type {
  CreateSmppAccountInput,
  FindPlatformSmppAccountsParams,
  FindPlatformSmppAccountsResult,
  PlatformSmppAccount,
  SmppAccount,
  UpdateSmppAccountInput,
} from "../api/smpp-accounts-api";

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ============================================================================
// Configuration
// ============================================================================

function getApiUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL?.trim();

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(/\/+$/, "");
}

// ============================================================================
// Cookies
// ============================================================================

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");
}

// ============================================================================
// Request
// ============================================================================

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T | undefined> {
  const response = await fetch(
    `${getApiUrl()}${path}`,
    {
      ...init,

      headers: {
        ...(init?.headers ?? {}),

        cookie:
          await getCookieHeader(),
      },

      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return undefined;
  }

  const body =
    await response.text();

  if (!response.ok) {
    throw new Error(
      body ||
      `Request failed with status ${response.status}.`,
    );
  }

  if (!body) {
    return undefined;
  }

  return JSON.parse(body) as T;
}

// ============================================================================
// Response Helpers
// ============================================================================

function extractData<T>(
  response: ApiResponse<T>,
): T {
  if (!response.success) {
    throw new Error(
      "The Control Plane API returned an unsuccessful response.",
    );
  }

  return response.data;
}

// ============================================================================
// Queries
// ============================================================================

export async function findSmppAccounts(
  clientId: string,
): Promise<SmppAccount[]> {
  const response =
    await request<
      ApiResponse<SmppAccount[]>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts`,
    );

  if (!response) {
    return [];
  }

  return extractData(response);
}

export async function findSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts/${encodeURIComponent(
        accountId,
      )}`,
    );

  if (!response) {
    throw new Error(
      "SMPP account response was empty.",
    );
  }

  return extractData(response);
}

// ============================================================================
// Create
// ============================================================================

export async function createSmppAccount(
  clientId: string,
  input: CreateSmppAccountInput,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(input),
      },
    );

  if (!response) {
    throw new Error(
      "SMPP account creation returned an empty response.",
    );
  }

  return extractData(response);
}

// ============================================================================
// Update
// ============================================================================

export async function updateSmppAccount(
  clientId: string,
  accountId: string,
  input: UpdateSmppAccountInput,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts/${encodeURIComponent(
        accountId,
      )}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(input),
      },
    );

  if (!response) {
    throw new Error(
      "SMPP account update returned an empty response.",
    );
  }

  return extractData(response);
}

// ============================================================================
// Password
// ============================================================================

export async function changeSmppPassword(
  clientId: string,
  accountId: string,
  password: string,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts/${encodeURIComponent(
        accountId,
      )}/password`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            password,
          }),
      },
    );

  if (!response) {
    throw new Error(
      "SMPP password change returned an empty response.",
    );
  }

  return extractData(response);
}

// ============================================================================
// Status
// ============================================================================

export async function activateSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts/${encodeURIComponent(
        accountId,
      )}/activate`,
      {
        method: "POST",
      },
    );

  if (!response) {
    throw new Error(
      "SMPP account activation returned an empty response.",
    );
  }

  return extractData(response);
}

export async function disableSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response =
    await request<
      ApiResponse<SmppAccount>
    >(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/smpp-accounts/${encodeURIComponent(
        accountId,
      )}/disable`,
      {
        method: "POST",
      },
    );

  if (!response) {
    throw new Error(
      "SMPP account disable returned an empty response.",
    );
  }

  return extractData(response);
}

export async function findPlatformSmppAccounts(
  params: FindPlatformSmppAccountsParams = {},
): Promise<FindPlatformSmppAccountsResult> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    query.set("pageSize", String(params.pageSize));
  }

  if (params.clientId !== undefined) {
    query.set("clientId", params.clientId);
  }

  if (params.status !== undefined) {
    query.set("status", params.status);
  }

  if (
    params.search !== undefined &&
    params.search.trim() !== ""
  ) {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString();

  const response =
    await request<
      ApiResponse<
        PlatformSmppAccount[]
      > & {
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      }
    >(
      `/api/smpp-accounts${queryString ? `?${queryString}` : ""
      }`,
    );

  if (!response) {
    throw new Error(
      "SMPP accounts response was empty.",
    );
  }

  if (!response.success) {
    throw new Error(
      "The Control Plane API returned an unsuccessful response.",
    );
  }

  return {
    data: response.data,
    pagination: response.pagination,
  };
}