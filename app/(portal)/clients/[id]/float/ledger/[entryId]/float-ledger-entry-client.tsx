"use client";

import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import type {
  FloatLedgerEntry,
} from "@/features/float/api/float-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface FloatLedgerEntryClientProps {
  readonly client: Client;

  readonly entry: FloatLedgerEntry;
}

// ============================================================================
// Component
// ============================================================================

export default function FloatLedgerEntryClient({
  client,
  entry,
}: FloatLedgerEntryClientProps) {
  const clientName =
    client.displayName ||
    client.companyName;

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="Float Transaction"
        description={`View float transaction details for ${clientName}.`}
      />

      {/* ======================================================================
          Client context
      ======================================================================= */}

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Client
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/clients/${encodeURIComponent(
                client.id,
              )}`}
              className="truncate text-sm font-semibold text-slate-900 transition hover:text-blue-600"
            >
              {clientName}
            </Link>

            <span className="font-mono text-xs text-slate-400">
              {client.publicId}
            </span>
          </div>
        </div>

        <Link
          href={`/clients/${encodeURIComponent(
            client.id,
          )}/float`}
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to float
        </Link>
      </div>

      {/* ======================================================================
          Transaction
      ======================================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Transaction
              </p>

              <p className="mt-1 font-mono text-xs text-slate-500">
                {entry.publicId}
              </p>
            </div>

            <FloatTransactionBadge
              type={
                entry.transactionType
              }
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* ------------------------------------------------------------------
              Credits
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Credits"
          >
            <span
              className={
                entry.credits >= 0
                  ? "font-semibold text-slate-900"
                  : "font-semibold text-red-600"
              }
            >
              {formatSignedCredits(
                entry.credits,
              )}
            </span>
          </DetailRow>

          {/* ------------------------------------------------------------------
              Transaction type
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Transaction type"
          >
            {formatTransactionType(
              entry.transactionType,
            )}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Reference type
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Reference type"
          >
            {entry.referenceType
              ? formatReferenceType(
                entry.referenceType,
              )
              : "—"}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Reference ID
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Reference ID"
          >
            {entry.referenceId ? (
              <span className="font-mono text-xs">
                {entry.referenceId}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Description
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Description"
          >
            {entry.description ??
              "—"}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Created by
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Created by"
          >
            {entry.createdById ? (
              <span className="font-mono text-xs">
                {entry.createdById}
              </span>
            ) : (
              "System"
            )}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Created
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Created"
          >
            {formatDate(
              entry.createdAt,
            )}
          </DetailRow>

          {/* ------------------------------------------------------------------
              Entry ID
          ------------------------------------------------------------------- */}

          <DetailRow
            label="Entry ID"
          >
            <span className="break-all font-mono text-xs">
              {entry.id}
            </span>
          </DetailRow>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Detail row
// ============================================================================

function DetailRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>

      <dd className="min-w-0 text-sm text-slate-900">
        {children}
      </dd>
    </div>
  );
}

// ============================================================================
// Transaction badge
// ============================================================================

function FloatTransactionBadge({
  type,
}: {
  readonly type:
  FloatLedgerEntry["transactionType"];
}) {
  switch (type) {
    case "TOPUP":
      return (
        <StatusBadge
          tone="success"
          dot
        >
          Top Up
        </StatusBadge>
      );

    case "DEBIT":
      return (
        <StatusBadge
          tone="warning"
          dot
        >
          Debit
        </StatusBadge>
      );

    case "REFUND":
      return (
        <StatusBadge
          tone="info"
          dot
        >
          Refund
        </StatusBadge>
      );

    case "ADJUSTMENT":
      return (
        <StatusBadge
          tone="neutral"
          dot
        >
          Adjustment
        </StatusBadge>
      );
  }
}

// ============================================================================
// Formatting
// ============================================================================

function formatCredits(
  credits: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
  ).format(
    credits,
  );
}

function formatSignedCredits(
  credits: number,
): string {
  if (
    credits > 0
  ) {
    return `+${formatCredits(
      credits,
    )}`;
  }

  if (
    credits < 0
  ) {
    return `-${formatCredits(
      Math.abs(
        credits,
      ),
    )}`;
  }

  return "0";
}

function formatTransactionType(
  type: FloatLedgerEntry["transactionType"],
): string {
  switch (type) {
    case "TOPUP":
      return "Top Up";

    case "DEBIT":
      return "Debit";

    case "REFUND":
      return "Refund";

    case "ADJUSTMENT":
      return "Adjustment";

    default:
      return type;
  }
}

function formatReferenceType(
  type: NonNullable<
    FloatLedgerEntry["referenceType"]
  >,
): string {
  switch (type) {
    case "MESSAGE":
      return "Message";

    case "ADMIN":
      return "Admin";

    case "SYSTEM":
      return "System";

    case "IMPORT":
      return "Import";

    default:
      return type;
  }
}