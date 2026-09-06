import { cookies } from "next/headers";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

import type {
  CreateMessageInput,
  FindMessagesParams,
  FindMessagesResult,
  FindPlatformMessagesResult,
  Message,
  MessageStatusEvent,
} from "./messages-api";

// ============================================================================
// Find Messages
// ============================================================================

export async function findMessages(
  clientId: string,
  params: FindMessagesParams = {},
): Promise<FindMessagesResult> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
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

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.encoding) {
    searchParams.set(
      "encoding",
      params.encoding,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.destination) {
    searchParams.set(
      "destination",
      params.destination,
    );
  }

  if (params.senderIdId) {
    searchParams.set(
      "senderIdId",
      params.senderIdId,
    );
  }

  if (
    params.submittedFrom
  ) {
    searchParams.set(
      "submittedFrom",
      params.submittedFrom,
    );
  }

  if (
    params.submittedTo
  ) {
    searchParams.set(
      "submittedTo",
      params.submittedTo,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/messages${query
        ? `?${query}`
        : ""}`,
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
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: Message[];

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
      "Unable to retrieve messages.",
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
      "Invalid messages response: pagination metadata is missing.",
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

// ============================================================================
// Find Platform Messages
// ============================================================================

export async function findPlatformMessages(
  params: FindMessagesParams = {},
): Promise<FindPlatformMessagesResult> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
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

  if (params.encoding) {
    searchParams.set(
      "encoding",
      params.encoding,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.destination) {
    searchParams.set(
      "destination",
      params.destination,
    );
  }

  if (params.senderIdId) {
    searchParams.set(
      "senderIdId",
      params.senderIdId,
    );
  }

  if (
    params.submittedFrom
  ) {
    searchParams.set(
      "submittedFrom",
      params.submittedFrom,
    );
  }

  if (
    params.submittedTo
  ) {
    searchParams.set(
      "submittedTo",
      params.submittedTo,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/messages${query
        ? `?${query}`
        : ""}`,
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
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: Message[];

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
      "Unable to retrieve platform messages.",
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
      "Invalid platform messages response: pagination metadata is missing.",
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

// ============================================================================
// Find Message by ID
// ============================================================================

export async function findMessageById(
  clientId: string,
  id: string,
): Promise<Message> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/${encodeURIComponent(
        id,
      )}`,
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
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: Message;

        message?: string;

        error?: string;
      } | null;

  if (!response.ok) {
    throw new Error(
      body?.message ??
      body?.error ??
      `Unable to retrieve message (${response.status}).`,
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid message response: data is missing.",
    );
  }

  return body.data;
}

// ============================================================================
// Find Message by Public ID
// ============================================================================

export async function findMessageByPublicId(
  clientId: string,
  publicId: string,
): Promise<Message> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/public/${encodeURIComponent(
        publicId,
      )}`,
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
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: Message;

        message?: string;

        error?: string;
      } | null;

  if (!response.ok) {
    throw new Error(
      body?.message ??
      body?.error ??
      `Unable to retrieve message (${response.status}).`,
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid message response: data is missing.",
    );
  }

  return body.data;
}

// ============================================================================
// Find Message Status Events
// ============================================================================

export async function findMessageStatusEvents(
  clientId: string,
  messageId: string,
): Promise<MessageStatusEvent[]> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/${encodeURIComponent(
        messageId,
      )}/status-events`,
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
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: MessageStatusEvent[];

        message?: string;

        error?: string;
      } | null;

  if (!response.ok) {
    throw new Error(
      body?.message ??
      body?.error ??
      `Unable to retrieve message status events (${response.status}).`,
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid message status events response: data is missing.",
    );
  }

  return body.data;
}

// ============================================================================
// Create Message
// ============================================================================

export async function createMessage(
  clientId: string,
  input: CreateMessageInput,
): Promise<Message> {
  const cookieStore =
    await cookies();

  const cookieHeader =
    cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/messages`,
      {
        method: "POST",

        headers: {
          Cookie:
            cookieHeader,

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
    (await response
      .json()
      .catch(
        () => null,
      )) as {
        success?: boolean;

        data?: Message;

        message?: string;

        error?: string;
      } | null;

  if (!response.ok) {
    throw new Error(
      body?.message ??
      body?.error ??
      `Unable to create message (${response.status}).`,
    );
  }

  if (!body?.data) {
    throw new Error(
      "Invalid message response: data is missing.",
    );
  }

  return body.data;
}