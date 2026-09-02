import { cookies } from "next/headers";

import { getControlPlaneUrl } from "@/lib/control-plane";

import type {
  FindSenderIdsParams,
  FindSenderIdsResult,
  SenderId,
} from "./sender-ids-api";

// ============================================================================
// Find Sender IDs
// ============================================================================

export async function findSenderIds(
  params: FindSenderIdsParams = {},
): Promise<FindSenderIdsResult> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({ name, value }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const searchParams =
    new URLSearchParams();

  if (
    params.page !==
    undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.pageSize !==
    undefined
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

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/sender-ids${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        headers: {
          Cookie:
            cookieHeader,
        },
        cache: "no-store",
      },
    );
  const body =
    (await response
      .json()
      .catch(() => null)) as {
        success?: boolean;
        data?: FindSenderIdsResult["items"];
        pagination?: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
        meta?: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
        message?: string;
        error?: string;
      } | null;

  // ==========================================================================
  // Error
  // ==========================================================================

  if (!response.ok) {
    throw new Error(
      body?.message ??
      body?.error ??
      "Unable to retrieve Sender IDs.",
    );
  }

  // ==========================================================================
  // Pagination
  // ==========================================================================

  const pagination =
    body?.pagination ??
    body?.meta;

  if (!pagination) {
    throw new Error(
      "Invalid Sender IDs response: pagination metadata is missing.",
    );
  }

  // ==========================================================================
  // Response
  // ==========================================================================

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

export async function findSenderIdById(
  id: string,
): Promise<SenderId> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({ name, value }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response = await fetch(
    `${getControlPlaneUrl()}/api/sender-ids/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const body =
    await response.json() as {
      success?: boolean;
      data?: SenderId;
      message?: string;
      error?: string;
    };

  if (!response.ok) {
    throw new Error(
      body.message ??
      body.error ??
      `Unable to retrieve Sender ID (${response.status}).`,
    );
  }

  if (!body.data) {
    throw new Error(
      "Invalid Sender ID response: data is missing.",
    );
  }

  return body.data;
}