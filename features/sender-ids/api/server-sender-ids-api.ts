import { cookies } from "next/headers";

import { getControlPlaneUrl } from "@/lib/control-plane";

import type {
  FindSenderIdsParams,
  FindSenderIdsResult,
  SenderId,
} from "./sender-ids-api";

// ============================================================================
// Types
// ============================================================================

interface ApiErrorBody {
  success?: boolean;
  message?: string;
  error?: string;
}

interface PaginatedSenderIdsBody {
  success?: boolean;
  data?: SenderId[];

  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };

  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };

  message?: string;
  error?: string;
}

interface SenderIdBody {
  success?: boolean;
  data?: SenderId;
  message?: string;
  error?: string;
}

// ============================================================================
// Helpers
// ============================================================================

async function getCookieHeader(): Promise<string> {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");
}

function buildQueryString(
  params: FindSenderIdsParams = {},
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

  if (params.clientId) {
    searchParams.set(
      "clientId",
      params.clientId,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.sender) {
    searchParams.set(
      "sender",
      params.sender,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (
    params.isDefault !==
    undefined
  ) {
    searchParams.set(
      "isDefault",
      String(
        params.isDefault,
      ),
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

function getApiErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return fallback;
  }

  const error =
    body as ApiErrorBody;

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

  return fallback;
}

async function parseJson<T>(
  response: Response,
): Promise<T | null> {
  return (
    (await response
      .json()
      .catch(() => null)) as T | null
  );
}

// ============================================================================
// Find Sender IDs
// ============================================================================

export async function findSenderIds(
  clientId: string,
  params: FindSenderIdsParams = {},
): Promise<FindSenderIdsResult> {
  const cookieHeader =
    await getCookieHeader();

  const query =
    buildQueryString(params);

  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/sender-ids${query}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const body =
    await parseJson<PaginatedSenderIdsBody>(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        body,
        `Unable to retrieve Sender IDs. (${response.status})`,
      ),
    );
  }

  const pagination =
    body?.pagination ??
    body?.meta;

  if (!pagination) {
    throw new Error(
      "Invalid Sender IDs response: pagination metadata is missing.",
    );
  }

  return {
    items:
      body?.data ?? [],

    meta: {
      page:
        pagination.page,

      pageSize:
        pagination.pageSize,

      total:
        pagination.totalItems,

      totalPages:
        pagination.totalPages,
    },
  };
}

// ============================================================================
// Find Sender ID by ID
// ============================================================================

export async function findSenderIdById(
  clientId: string,
  id: string,
): Promise<SenderId> {
  const cookieHeader =
    await getCookieHeader();

  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/sender-ids/${encodeURIComponent(
      id,
    )}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const body =
    await parseJson<SenderIdBody>(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        body,
        `Unable to retrieve Sender ID (${response.status}).`,
      ),
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid Sender ID response: data is missing.",
    );
  }

  return body.data;
}

// ============================================================================
// Platform: Find Sender IDs
// ============================================================================

export async function findPlatformSenderIds(
  params: FindSenderIdsParams = {},
): Promise<FindSenderIdsResult> {
  const cookieHeader =
    await getCookieHeader();

  const query =
    buildQueryString(params);

  const response = await fetch(
    `${getControlPlaneUrl()}/api/sender-ids${query}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const body =
    await parseJson<PaginatedSenderIdsBody>(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        body,
        `Unable to retrieve Sender IDs. (${response.status})`,
      ),
    );
  }

  const pagination =
    body?.pagination ??
    body?.meta;

  if (!pagination) {
    throw new Error(
      "Invalid Sender IDs response: pagination metadata is missing.",
    );
  }

  return {
    items:
      body?.data ?? [],

    meta: {
      page:
        pagination.page,

      pageSize:
        pagination.pageSize,

      total:
        pagination.totalItems,

      totalPages:
        pagination.totalPages,
    },
  };
}

// ============================================================================
// Platform: Find Sender ID by ID
// ============================================================================

export async function findPlatformSenderIdById(
  id: string,
): Promise<SenderId> {
  const cookieHeader =
    await getCookieHeader();

  const response = await fetch(
    `${getControlPlaneUrl()}/api/sender-ids/${encodeURIComponent(
      id,
    )}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const body =
    await parseJson<SenderIdBody>(
      response,
    );

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        body,
        `Unable to retrieve Sender ID (${response.status}).`,
      ),
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid Sender ID response: data is missing.",
    );
  }

  return body.data;
}