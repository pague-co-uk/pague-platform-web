import {
  cookies,
} from "next/headers";

import type {
  AdjustFloatInput,
  DebitFloatInput,
  FindFloatLedgerInput,
  FindPlatformFloatLedgerInput,
  FloatLedgerEntry,
  PlatformFloatLedgerEntry,
  PlatformFloatLedgerPagination,
  RefundFloatInput,
  TopUpFloatInput,
} from "../api/float-api";

// ============================================================================
// Types
// ============================================================================

export interface FloatLedgerResult {
  readonly items: readonly FloatLedgerEntry[];

  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface PlatformFloatLedgerResult {
  readonly items: readonly PlatformFloatLedgerEntry[];

  readonly pagination: PlatformFloatLedgerPagination;
}

// ============================================================================
// Error
// ============================================================================

export class FloatApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "FloatApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Session
// ============================================================================

async function getSessionCookie() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "session",
    );

  if (!session) {
    throw new FloatApiError(
      "Authentication required.",
      401,
    );
  }

  return session;
}

// ============================================================================
// Get float balance
//
// Server-side only.
// ============================================================================

export async function getFloatBalance(
  clientId: string,
): Promise<number> {
  const session =
    await getSessionCookie();

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(clientId)}/float/balance`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Float] Failed to connect to Control Plane.",
      error,
    );

    throw new FloatApiError(
      "Unable to connect to the float service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new FloatApiError(
      getFloatErrorMessage(
        body,
        "Unable to load float balance.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !==
    "number"
  ) {
    throw new FloatApiError(
      "Invalid float balance response.",
      response.status,
    );
  }

  return body.data;
}

// ============================================================================
// Find platform float ledger
//
// Server-side only.
// ============================================================================

export async function findPlatformFloatLedger(
  options: FindPlatformFloatLedgerInput = {},
): Promise<PlatformFloatLedgerResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(
      options.page ?? 1,
    ),
  );

  params.set(
    "pageSize",
    String(
      options.pageSize ?? 20,
    ),
  );

  if (
    options.clientId !==
    undefined
  ) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  if (
    options.transactionType !==
    undefined
  ) {
    params.set(
      "transactionType",
      options.transactionType,
    );
  }

  if (
    options.referenceType !==
    undefined
  ) {
    params.set(
      "referenceType",
      options.referenceType,
    );
  }

  if (
    options.search !==
    undefined &&
    options.search.trim() !==
    ""
  ) {
    params.set(
      "search",
      options.search.trim(),
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/float?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Float] Failed to connect to Control Plane.",
      error,
    );

    throw new FloatApiError(
      "Unable to connect to the float service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new FloatApiError(
      getFloatErrorMessage(
        body,
        "Unable to load float ledger.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    !Array.isArray(body.data) ||
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new FloatApiError(
      "Invalid platform float ledger response.",
      response.status,
    );
  }

  const pagination =
    body.pagination;

  if (
    !("page" in pagination) ||
    typeof pagination.page !==
    "number" ||
    !("pageSize" in pagination) ||
    typeof pagination.pageSize !==
    "number" ||
    !("totalItems" in pagination) ||
    typeof pagination.totalItems !==
    "number" ||
    !("totalPages" in pagination) ||
    typeof pagination.totalPages !==
    "number"
  ) {
    throw new FloatApiError(
      "Invalid platform float ledger pagination response.",
      response.status,
    );
  }

  return {
    items:
      body.data as PlatformFloatLedgerEntry[],

    pagination: {
      page:
        pagination.page,

      pageSize:
        pagination.pageSize,

      totalItems:
        pagination.totalItems,

      totalPages:
        pagination.totalPages,
    },
  };
}

// ============================================================================
// Find float ledger
//
// Server-side only.
// ============================================================================

export async function findFloatLedger(
  clientId: string,
  options: FindFloatLedgerInput = {},
): Promise<FloatLedgerResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Pagination
  // --------------------------------------------------------------------------

  params.set(
    "page",
    String(
      options.page ?? 1,
    ),
  );

  params.set(
    "pageSize",
    String(
      options.pageSize ?? 20,
    ),
  );

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(clientId)}/float/ledger?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Float] Failed to connect to Control Plane.",
      error,
    );

    throw new FloatApiError(
      "Unable to connect to the float service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new FloatApiError(
      getFloatErrorMessage(
        body,
        "Unable to load float ledger.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !== "object" ||
    body.data === null
  ) {
    throw new FloatApiError(
      "Invalid float ledger response.",
      response.status,
    );
  }

  const data =
    body.data;

  if (
    !("items" in data) ||
    !Array.isArray(data.items) ||
    !("meta" in data) ||
    typeof data.meta !== "object" ||
    data.meta === null
  ) {
    throw new FloatApiError(
      "Invalid float ledger response.",
      response.status,
    );
  }

  const meta =
    data.meta;

  if (
    !("page" in meta) ||
    typeof meta.page !== "number" ||
    !("pageSize" in meta) ||
    typeof meta.pageSize !== "number" ||
    !("total" in meta) ||
    typeof meta.total !== "number" ||
    !("totalPages" in meta) ||
    typeof meta.totalPages !== "number"
  ) {
    throw new FloatApiError(
      "Invalid float ledger pagination response.",
      response.status,
    );
  }

  return {
    items:
      data.items as FloatLedgerEntry[],

    meta: {
      page:
        meta.page,

      pageSize:
        meta.pageSize,

      total:
        meta.total,

      totalPages:
        meta.totalPages,
    },
  };
}

// ============================================================================
// Find ledger entry
//
// Server-side only.
// ============================================================================

export async function findFloatLedgerEntry(
  clientId: string,
  entryId: string,
): Promise<FloatLedgerEntry | null> {
  const session =
    await getSessionCookie();

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(clientId)}/float/ledger/${encodeURIComponent(entryId)}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Float] Failed to connect to Control Plane.",
      error,
    );

    throw new FloatApiError(
      "Unable to connect to the float service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new FloatApiError(
      getFloatErrorMessage(
        body,
        "Unable to load float ledger entry.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body)
  ) {
    throw new FloatApiError(
      "Invalid float ledger entry response.",
      response.status,
    );
  }

  if (
    body.data ===
    null
  ) {
    return null;
  }

  if (
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new FloatApiError(
      "Invalid float ledger entry response.",
      response.status,
    );
  }

  return body.data as FloatLedgerEntry;
}

// ============================================================================
// Top up
//
// Server-side only.
// ============================================================================

export async function topUpFloat(
  clientId: string,
  input: TopUpFloatInput,
): Promise<FloatLedgerEntry> {
  return mutateFloat(
    clientId,
    "/top-up",
    input,
    "Unable to top up float.",
  );
}

// ============================================================================
// Debit
//
// Server-side only.
// ============================================================================

export async function debitFloat(
  clientId: string,
  input: DebitFloatInput,
): Promise<FloatLedgerEntry> {
  return mutateFloat(
    clientId,
    "/debit",
    input,
    "Unable to debit float.",
  );
}

// ============================================================================
// Refund
//
// Server-side only.
// ============================================================================

export async function refundFloat(
  clientId: string,
  input: RefundFloatInput,
): Promise<FloatLedgerEntry> {
  return mutateFloat(
    clientId,
    "/refund",
    input,
    "Unable to refund float.",
  );
}

// ============================================================================
// Adjustment
//
// Server-side only.
// ============================================================================

export async function adjustFloat(
  clientId: string,
  input: AdjustFloatInput,
): Promise<FloatLedgerEntry> {
  return mutateFloat(
    clientId,
    "/adjust",
    input,
    "Unable to adjust float.",
  );
}

// ============================================================================
// Mutation helper
// ============================================================================

async function mutateFloat(
  clientId: string,
  path: string,
  input:
    | TopUpFloatInput
    | DebitFloatInput
    | RefundFloatInput
    | AdjustFloatInput,
  fallback: string,
): Promise<FloatLedgerEntry> {
  const session =
    await getSessionCookie();

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(clientId)}/float${path}`,
        {
          method: "POST",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              input,
            ),

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Float] Failed to connect to Control Plane.",
      error,
    );

    throw new FloatApiError(
      "Unable to connect to the float service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new FloatApiError(
      getFloatErrorMessage(
        body,
        fallback,
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new FloatApiError(
      "Invalid float mutation response.",
      response.status,
    );
  }

  return body.data as FloatLedgerEntry;
}

// ============================================================================
// Error extraction
// ============================================================================

function getFloatErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !==
    "object" ||
    data === null
  ) {
    return fallback;
  }

  // --------------------------------------------------------------------------
  // Standard API error envelope
  // --------------------------------------------------------------------------

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message ===
    "string" &&
    data.error.message.trim()
  ) {
    return data.error.message;
  }

  // --------------------------------------------------------------------------
  // Direct message
  // --------------------------------------------------------------------------

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}