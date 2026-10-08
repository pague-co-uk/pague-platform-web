"use client";

import Link from "next/link";

import {
  PageHeader,
} from "@/components/layout/page-header";


import {
  StatusBadge,
} from "@/components/ui/status-badge";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import type {
  Transaction,
} from "../types/transaction";

interface TransactionDetailsProps {
  readonly transaction: Transaction;
}

// ============================================================================
// Status
// ============================================================================

function getStatusTone(
  status: Transaction["status"],
) {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "FAILED":
    case "REVERSED":
    case "CANCELLED":
      return "danger";

    case "PROCESSING":
      return "warning";

    case "PENDING":
    default:
      return "neutral";
  }
}

// ============================================================================
// Formatting
// ============================================================================

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function formatAmount(
  transaction: Transaction,
): string {
  return `${transaction.currencyCode} ${transaction.amount}`;
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
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm text-slate-900">
        {children}
      </dd>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function TransactionDetails({
  transaction,
}: TransactionDetailsProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">

      {/* ================================================================== */}
      {/* Back navigation                                                     */}
      {/* ================================================================== */}

      <ContextAwareBackLinks
        clientHref="/transactions"
        clientLabel="Back to transactions"
        showPlatformLink={false}
      />

      {/* ================================================================== */}
      {/* Page header                                                         */}
      {/* ================================================================== */}

      <div>
        <PageHeader
          title={transaction.publicId}
          description="Transaction details and processing information."
        />
      </div>

      {/* ================================================================== */}
      {/* Transaction status                                                 */}
      {/* ================================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Transaction status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current processing state.
            </p>
          </div>

          <StatusBadge
            tone={getStatusTone(
              transaction.status,
            )}
            dot
          >
            {transaction.status}
          </StatusBadge>
        </div>

        <dl className="space-y-5 p-6">
          <DetailRow label="Transaction ID">
            {transaction.id}
          </DetailRow>

          <DetailRow label="Public ID">
            {transaction.publicId}
          </DetailRow>

          <DetailRow label="Reference">
            {transaction.reference}
          </DetailRow>

          <DetailRow label="Provider reference">
            {transaction.providerReference ??
              "—"}
          </DetailRow>

          <DetailRow label="Amount">
            <span className="font-medium">
              {formatAmount(transaction)}
            </span>
          </DetailRow>

          <DetailRow label="Transaction type">
            <div>
              <div className="font-medium">
                {transaction.transactionTypeName}
              </div>

              <div className="text-xs text-slate-500">
                {transaction.transactionTypeCode}
              </div>
            </div>
          </DetailRow>

          <DetailRow label="Description">
            {transaction.description ??
              "—"}
          </DetailRow>
        </dl>
      </div>

      {/* ================================================================== */}
      {/* Client and service                                                 */}
      {/* ================================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Client and service
          </h2>
        </div>

        <dl className="space-y-5 p-6">
          <DetailRow label="Client">
            <Link
              href={`/clients/${encodeURIComponent(
                transaction.clientId,
              )}`}
              className="font-medium text-slate-950 hover:text-slate-700"
            >
              {transaction.clientName}
            </Link>
          </DetailRow>

          <DetailRow label="Service">
            <div>
              <div className="font-medium">
                {transaction.serviceName}
              </div>

              <div className="text-xs text-slate-500">
                {transaction.serviceCode}
              </div>
            </div>
          </DetailRow>

          <DetailRow label="Client service">
            {transaction.clientServiceId}
          </DetailRow>
        </dl>
      </div>

      {/* ================================================================== */}
      {/* Provider                                                            */}
      {/* ================================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Provider
          </h2>
        </div>

        <dl className="space-y-5 p-6">
          <DetailRow label="Provider">
            {transaction.providerName ??
              "—"}
          </DetailRow>

          <DetailRow label="Provider code">
            {transaction.providerCode ??
              "—"}
          </DetailRow>

          <DetailRow label="Provider status">
            {transaction.providerStatus ??
              "—"}
          </DetailRow>

          <DetailRow label="Provider service">
            {transaction.providerServiceCode ??
              "—"}
          </DetailRow>

          <DetailRow label="External service code">
            {transaction.providerServiceExternalCode ??
              "—"}
          </DetailRow>
        </dl>
      </div>

      {/* ================================================================== */}
      {/* Currency and processing                                             */}
      {/* ================================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Currency and processing
          </h2>
        </div>

        <dl className="space-y-5 p-6">
          <DetailRow label="Currency">
            <div>
              <div className="font-medium">
                {transaction.currencyName}
              </div>

              <div className="text-xs text-slate-500">
                {transaction.currencyCode}

                {transaction.currencySymbol
                  ? ` · ${transaction.currencySymbol}`
                  : ""}
              </div>
            </div>
          </DetailRow>

          <DetailRow label="Processed at">
            {formatDate(
              transaction.processedAt,
            )}
          </DetailRow>

          <DetailRow label="Created at">
            {formatDate(
              transaction.createdAt,
            )}
          </DetailRow>

          <DetailRow label="Updated at">
            {formatDate(
              transaction.updatedAt,
            )}
          </DetailRow>
        </dl>
      </div>

      {/* ================================================================== */}
      {/* Processing data                                                     */}
      {/* ================================================================== */}

      {(transaction.metadata ||
        transaction.providerResponse) && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-sm font-semibold text-slate-950">
                Processing data
              </h2>
            </div>

            <div className="space-y-6 p-6">
              {transaction.metadata && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metadata
                  </h3>

                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                    {JSON.stringify(
                      transaction.metadata,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}

              {transaction.providerResponse && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Provider response
                  </h3>

                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                    {JSON.stringify(
                      transaction.providerResponse,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}