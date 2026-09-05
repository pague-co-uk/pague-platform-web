"use client";

// ============================================================================
// Types
// ============================================================================

export type LedgerTransactionType =
  | "TOPUP"
  | "DEBIT"
  | "REFUND"
  | "ADJUSTMENT";

export type LedgerReferenceType =
  | "MESSAGE"
  | "ADMIN"
  | "SYSTEM"
  | "IMPORT";

export interface FloatLedgerEntry {
  id: string;
  publicId: string;
  clientId: string;
  createdById: string | null;

  transactionType: LedgerTransactionType;

  credits: number;

  referenceType: LedgerReferenceType | null;
  referenceId: string | null;

  description: string | null;

  createdAt: string;
}

export interface FloatLedgerMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface FloatLedgerResponse {
  readonly items: FloatLedgerEntry[];
  readonly meta: FloatLedgerMeta;
}

export interface FindFloatLedgerInput {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface TopUpFloatInput {
  readonly credits: number;
  readonly referenceId?: string;
  readonly description?: string;
}

export interface DebitFloatInput {
  readonly credits: number;
  readonly referenceType: LedgerReferenceType;
  readonly referenceId: string;
  readonly description?: string;
}

export interface RefundFloatInput {
  readonly credits: number;
  readonly referenceType: LedgerReferenceType;
  readonly referenceId: string;
  readonly description?: string;
}

export interface AdjustFloatInput {
  readonly credits: number;
  readonly referenceId?: string;
  readonly description: string;
}

// ============================================================================
// API response
// ============================================================================

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
    readonly path?: string;
  };
}

// ============================================================================
// Request helper
// ============================================================================

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response =
    await fetch(
      url,
      {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          ...options?.headers,
        },
      },
    );

  const body =
    await response.text();

  if (!response.ok) {
    throw new Error(
      body ||
      `Float API request failed with status ${response.status}.`,
    );
  }

  if (!body) {
    return undefined as T;
  }

  const parsed =
    JSON.parse(
      body,
    ) as ApiResponse<T>;

  return parsed.data;
}

// ============================================================================
// URLs
// ============================================================================

function floatUrl(
  clientId: string,
  path = "",
): string {
  return (
    `/api/clients/${encodeURIComponent(
      clientId,
    )}/float${path}`
  );
}

// ============================================================================
// Balance
// ============================================================================

export async function getFloatBalance(
  clientId: string,
): Promise<number> {
  return request<number>(
    floatUrl(
      clientId,
      "/balance",
    ),
  );
}

// ============================================================================
// Ledger
// ============================================================================

export async function findFloatLedger(
  clientId: string,
  input: FindFloatLedgerInput = {},
): Promise<FloatLedgerResponse> {
  const params =
    new URLSearchParams();

  if (
    input.page !==
    undefined
  ) {
    params.set(
      "page",
      String(
        input.page,
      ),
    );
  }

  if (
    input.pageSize !==
    undefined
  ) {
    params.set(
      "pageSize",
      String(
        input.pageSize,
      ),
    );
  }

  const query =
    params.toString();

  return request<FloatLedgerResponse>(
    floatUrl(
      clientId,
      `/ledger${query ? `?${query}` : ""}`,
    ),
  );
}

export async function findFloatLedgerEntry(
  clientId: string,
  entryId: string,
): Promise<FloatLedgerEntry | null> {
  return request<FloatLedgerEntry | null>(
    floatUrl(
      clientId,
      `/ledger/${encodeURIComponent(
        entryId,
      )}`,
    ),
  );
}

export async function findFloatLedgerEntryByPublicId(
  clientId: string,
  publicId: string,
): Promise<FloatLedgerEntry | null> {
  return request<FloatLedgerEntry | null>(
    floatUrl(
      clientId,
      `/ledger/public/${encodeURIComponent(
        publicId,
      )}`,
    ),
  );
}

// ============================================================================
// Top-up
// ============================================================================

export async function topUpFloat(
  clientId: string,
  input: TopUpFloatInput,
): Promise<FloatLedgerEntry> {
  return request<FloatLedgerEntry>(
    floatUrl(
      clientId,
      "/top-up",
    ),
    {
      method: "POST",
      body: JSON.stringify(
        input,
      ),
    },
  );
}

// ============================================================================
// Debit
// ============================================================================

export async function debitFloat(
  clientId: string,
  input: DebitFloatInput,
): Promise<FloatLedgerEntry> {
  return request<FloatLedgerEntry>(
    floatUrl(
      clientId,
      "/debit",
    ),
    {
      method: "POST",
      body: JSON.stringify(
        input,
      ),
    },
  );
}

// ============================================================================
// Refund
// ============================================================================

export async function refundFloat(
  clientId: string,
  input: RefundFloatInput,
): Promise<FloatLedgerEntry> {
  return request<FloatLedgerEntry>(
    floatUrl(
      clientId,
      "/refund",
    ),
    {
      method: "POST",
      body: JSON.stringify(
        input,
      ),
    },
  );
}

// ============================================================================
// Adjustment
// ============================================================================

export async function adjustFloat(
  clientId: string,
  input: AdjustFloatInput,
): Promise<FloatLedgerEntry> {
  return request<FloatLedgerEntry>(
    floatUrl(
      clientId,
      "/adjust",
    ),
    {
      method: "POST",
      body: JSON.stringify(
        input,
      ),
    },
  );
}