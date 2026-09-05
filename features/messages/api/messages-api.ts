export type MessageStatus =
  | "QUEUED"
  | "ROUTED"
  | "SUBMITTED"
  | "DELIVERED"
  | "FAILED"
  | "EXPIRED";

export type MessageEncoding =
  | "GSM7"
  | "UCS2"
  | "BINARY";

export interface Message {
  id: string;
  publicId: string;
  clientId: string;
  senderIdId: string | null;

  destination: string;
  body: string;
  encoding: MessageEncoding;
  segmentCount: number;
  currentStatus: MessageStatus;

  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageStatusEvent {
  id: string;
  messageId: string;
  attemptId: string | null;

  status: MessageStatus;
  source: string;
  description: string | null;
  rawData: unknown;

  createdAt: string;
}

export interface FindMessagesParams {
  page?: number;
  pageSize?: number;
  status?: MessageStatus;
  encoding?: MessageEncoding;
  search?: string;
  destination?: string;
  senderIdId?: string;
  submittedFrom?: string;
  submittedTo?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FindMessagesResult {
  items: Message[];
  meta: PaginationMeta;
}

export interface CreateMessageInput {
  senderIdId?: string;
  destination: string;
  body: string;
  encoding: MessageEncoding;
}

export interface BulkMessageUploadResult {
  messages: Message[];
}

export interface SpreadsheetValidationError {
  row: number;
  field: string;
  message: string;
}

export interface BulkMessageValidationErrorResponse {
  message: string;
  errors: SpreadsheetValidationError[];
}

export class MessagesApiError extends Error {
  readonly status: number;
  readonly errors: readonly SpreadsheetValidationError[];

  constructor(
    message: string,
    status: number,
    errors: readonly SpreadsheetValidationError[] = [],
  ) {
    super(message);

    this.name = "MessagesApiError";
    this.status = status;
    this.errors = errors;

    Object.setPrototypeOf(
      this,
      MessagesApiError.prototype,
    );
  }
}

// ============================================================================
// API response types
// ============================================================================

interface PaginatedMessagesResponse {
  success: boolean;
  data: Message[];

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
}

// ============================================================================
// Error handling
// ============================================================================

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getMessageFromValue(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const messages = value.filter(
      (item): item is string =>
        typeof item === "string",
    );

    if (messages.length > 0) {
      return messages.join(", ");
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  if (Array.isArray(value.message)) {
    const messages = value.message.filter(
      (item): item is string =>
        typeof item === "string",
    );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof value.error === "string") {
    return value.error;
  }

  if (Array.isArray(value.error)) {
    const messages = value.error.filter(
      (item): item is string =>
        typeof item === "string",
    );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (isRecord(value.error)) {
    const nestedMessage =
      getMessageFromValue(value.error);

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  if (isRecord(value.data)) {
    const nestedMessage =
      getMessageFromValue(value.data);

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return null;
}

function getMessageErrorMessage(
  body: unknown,
  fallback: string,
): string {
  return (
    getMessageFromValue(body) ??
    fallback
  );
}

function normalizeSpreadsheetValidationError(
  value: unknown,
): SpreadsheetValidationError | null {
  if (!isRecord(value)) {
    return null;
  }

  const row =
    typeof value.row === "number"
      ? value.row
      : typeof value.row === "string"
        ? Number(value.row)
        : NaN;

  const field =
    typeof value.field === "string"
      ? value.field
      : null;

  const message =
    typeof value.message === "string"
      ? value.message
      : null;

  if (
    !Number.isFinite(row) ||
    !field ||
    !message
  ) {
    return null;
  }

  return {
    row,
    field,
    message,
  };
}

function extractSpreadsheetValidationErrors(
  value: unknown,
): SpreadsheetValidationError[] {
  if (!isRecord(value)) {
    return [];
  }

  // Standard API error envelope:
  //
  // {
  //   success: false,
  //   error: {
  //     code: "BAD_REQUEST",
  //     message: "Spreadsheet validation failed.",
  //     details: [...]
  //   }
  //
  if (isRecord(value.error)) {
    const details =
      value.error.details;

    if (Array.isArray(details)) {
      const errors = details
        .map(
          normalizeSpreadsheetValidationError,
        )
        .filter(
          (
            error,
          ): error is SpreadsheetValidationError =>
            error !== null,
        );

      if (errors.length > 0) {
        return errors;
      }
    }

    // Support nested error envelopes if ever required.
    const nestedErrors =
      extractSpreadsheetValidationErrors(
        value.error,
      );

    if (nestedErrors.length > 0) {
      return nestedErrors;
    }
  }

  // Direct errors array.
  if (Array.isArray(value.errors)) {
    const errors = value.errors
      .map(
        normalizeSpreadsheetValidationError,
      )
      .filter(
        (
          error,
        ): error is SpreadsheetValidationError =>
          error !== null,
      );

    if (errors.length > 0) {
      return errors;
    }
  }

  // Enveloped data response.
  if (isRecord(value.data)) {
    const nestedErrors =
      extractSpreadsheetValidationErrors(
        value.data,
      );

    if (nestedErrors.length > 0) {
      return nestedErrors;
    }
  }

  return [];
}

async function parseApiError(
  response: Response,
  fallback: string,
): Promise<MessagesApiError> {
  let body: unknown = null;

  try {
    body =
      await response.json();
  } catch (error) {
    console.error(
      "[Messages API] Failed to parse error response as JSON",
      {
        status:
          response.status,
        error,
      },
    );

    return new MessagesApiError(
      fallback,
      response.status,
    );
  }

  console.group(
    "[Messages API] Error response",
  );

  console.log(
    "HTTP status:",
    response.status,
  );

  console.log(
    "Raw response body:",
    body,
  );

  console.log(
    "Raw response body JSON:",
    JSON.stringify(
      body,
      null,
      2,
    ),
  );

  console.log(
    "Extracted message:",
    getMessageErrorMessage(
      body,
      fallback,
    ),
  );

  console.log(
    "Extracted validation errors:",
    extractSpreadsheetValidationErrors(
      body,
    ),
  );

  console.groupEnd();

  return new MessagesApiError(
    getMessageErrorMessage(
      body,
      fallback,
    ),
    response.status,
    extractSpreadsheetValidationErrors(
      body,
    ),
  );
}

// ============================================================================
// Bulk message upload
// ============================================================================

export async function createMessagesFromSpreadsheet(
  clientId: string,
  file: File,
): Promise<Message[]> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/bulk`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw await parseApiError(
      response,
      "Unable to create messages from spreadsheet.",
    );
  }

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    throw new MessagesApiError(
      "Invalid bulk message response.",
      response.status,
    );
  }

  if (
    !isRecord(body) ||
    !("data" in body)
  ) {
    throw new MessagesApiError(
      "Invalid bulk message response: data is missing.",
      response.status,
    );
  }

  const data = body.data;

  if (!Array.isArray(data)) {
    throw new MessagesApiError(
      "Invalid bulk message response.",
      response.status,
    );
  }

  return data as Message[];
}

// ============================================================================
// Query string
// ============================================================================

function buildQueryString(
  params: FindMessagesParams = {},
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

  if (params.submittedFrom) {
    searchParams.set(
      "submittedFrom",
      params.submittedFrom,
    );
  }

  if (params.submittedTo) {
    searchParams.set(
      "submittedTo",
      params.submittedTo,
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

// ============================================================================
// Generic response parser
// ============================================================================

async function parseResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new MessagesApiError(
        fallback,
        response.status,
      );
    }

    throw new MessagesApiError(
      "Invalid API response.",
      response.status,
    );
  }

  if (!response.ok) {
    throw new MessagesApiError(
      getMessageErrorMessage(
        body,
        fallback,
      ),
      response.status,
      extractSpreadsheetValidationErrors(
        body,
      ),
    );
  }

  return body as T;
}

// ============================================================================
// Messages
// ============================================================================

export async function findMessages(
  clientId: string,
  params: FindMessagesParams = {},
): Promise<FindMessagesResult> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages${buildQueryString(params)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<PaginatedMessagesResponse>(
      response,
      "Unable to retrieve messages.",
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

export async function findMessageById(
  clientId: string,
  id: string,
): Promise<Message> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Message;
    }>(
      response,
      "Unable to retrieve message.",
    );

  return body.data;
}

export async function findMessageByPublicId(
  clientId: string,
  publicId: string,
): Promise<Message> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/public/${encodeURIComponent(
        publicId,
      )}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: Message;
    }>(
      response,
      "Unable to retrieve message.",
    );

  return body.data;
}

export async function findMessageStatusEvents(
  clientId: string,
  messageId: string,
): Promise<MessageStatusEvent[]> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages/${encodeURIComponent(
        messageId,
      )}/status-events`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    await parseResponse<{
      success: boolean;
      data: MessageStatusEvent[];
    }>(
      response,
      "Unable to retrieve message status events.",
    );

  return body.data;
}

export async function createMessage(
  clientId: string,
  input: CreateMessageInput,
): Promise<Message> {
  const response =
    await fetch(
      `/api/clients/${encodeURIComponent(
        clientId,
      )}/messages`,
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
      data: Message;
    }>(
      response,
      "Unable to create message.",
    );

  return body.data;
}