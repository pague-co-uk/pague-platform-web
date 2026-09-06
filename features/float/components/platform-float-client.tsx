"use client";

import Link from "next/link";

import {
  DataTable,
} from "@/components/ui/data-table";

import type {
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  PlatformFloatLedgerEntry,
  PlatformFloatLedgerPagination,
} from "@/features/float/api/float-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Props
// ============================================================================

interface PlatformFloatClientProps {
  readonly ledger: readonly PlatformFloatLedgerEntry[];

  readonly pagination: PlatformFloatLedgerPagination;
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformFloatClient({
  ledger,
  pagination,
}: PlatformFloatClientProps) {
  const columns:
    DataTableColumn<PlatformFloatLedgerEntry>[] =
    [
      {
        key: "createdAt",

        header: "Date",

        render: (entry) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              entry.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "client",

        header: "Client",

        render: (entry) => {
          const clientName =
            entry.client.displayName ||
            entry.client.companyName;

          return (
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900">
                {clientName}
              </div>

              <div className="font-mono text-xs text-slate-500">
                {entry.client.publicId}
              </div>
            </div>
          );
        },
      },

      {
        key: "transactionType",

        header: "Type",

        render: (entry) => (
          <FloatTransactionBadge
            type={
              entry.transactionType
            }
          />
        ),
      },

      {
        key: "publicId",

        header: "Public ID",

        render: (entry) => (
          <span className="font-mono text-xs text-slate-600">
            {entry.publicId}
          </span>
        ),
      },

      {
        key: "credits",

        header: "Credits",

        className:
          "text-right",

        render: (entry) => (
          <span
            className={
              entry.credits >= 0
                ? "font-medium text-slate-900"
                : "font-medium text-red-600"
            }
          >
            {formatSignedCredits(
              entry.credits,
            )}
          </span>
        ),
      },

      {
        key: "reference",

        header: "Reference",

        render: (entry) => (
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-slate-600">
              {entry.referenceId ??
                "—"}
            </p>

            {entry.referenceType && (
              <p className="mt-0.5 text-[11px] text-slate-400">
                {formatReferenceType(
                  entry.referenceType,
                )}
              </p>
            )}
          </div>
        ),
      },

      {
        key: "description",

        header: "Description",

        render: (entry) => (
          <span className="text-sm text-slate-500">
            {entry.description ??
              "—"}
          </span>
        ),
      },

      {
        key: "actions",

        header: "",

        className:
          "w-[1%] whitespace-nowrap text-right",

        render: (entry) => (
          <Link
            href={`/clients/${entry.client.id}/float`}
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            View
          </Link>
        ),
      },
    ];

  return (
    <PageContainer>
      <PageHeader
        title="Float"
        description="Float ledger transactions across all clients."
      />

      {ledger.length === 0 ? (
        <EmptyState
          title="No float transactions"
          description="No float ledger transactions match the current filters."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={ledger}
            getRowKey={(entry) =>
              entry.id
            }
            onRowClick={(entry) => {
              window.location.href =
                `/clients/${entry.client.id}/float`;
            }}
          />

          <div className="mt-4">
            <Pagination
              meta={{
                page:
                  pagination.page,

                pageSize:
                  pagination.pageSize,

                total:
                  pagination.totalItems,

                totalPages:
                  pagination.totalPages,
              }}
            />
          </div>
        </>
      )}
    </PageContainer>
  );
}

// ============================================================================
// Transaction badge
// ============================================================================

function FloatTransactionBadge({
  type,
}: {
  readonly type:
  PlatformFloatLedgerEntry["transactionType"];
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
  ).format(credits);
}

function formatSignedCredits(
  credits: number,
): string {
  if (credits > 0) {
    return `+${formatCredits(
      credits,
    )}`;
  }

  if (credits < 0) {
    return `-${formatCredits(
      Math.abs(credits),
    )}`;
  }

  return "0";
}

function formatReferenceType(
  type: NonNullable<
    PlatformFloatLedgerEntry["referenceType"]
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