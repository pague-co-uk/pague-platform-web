"use client";

import { AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

import {
  FilterBar,
  FilterSelect,
} from "@/components/ui/filter-bar";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  exportClientFloatLedgerReport,
  exportPlatformFloatLedgerReport,
  findClientFloatLedgerReport,
  findPlatformFloatLedgerReport,
  type FindClientFloatLedgerReportParams,
  type FindFloatLedgerReportParams,
} from "../api/reports-api";

import type {
  FloatLedgerReportRow,
} from "../types/report-types";

// ============================================================================
// Types
// ============================================================================

interface FloatLedgerReportProps {
  readonly clientId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25;

const TRANSACTION_TYPES = [
  {
    value: "TOPUP",
    label: "Top-up",
  },
  {
    value: "DEBIT",
    label: "Debit",
  },
  {
    value: "REFUND",
    label: "Refund",
  },
  {
    value: "ADJUSTMENT",
    label: "Adjustment",
  },
] as const;

const REFERENCE_TYPES = [
  {
    value: "MESSAGE",
    label: "Message",
  },
  {
    value: "TOPUP",
    label: "Top-up",
  },
  {
    value: "REFUND",
    label: "Refund",
  },
  {
    value: "ADJUSTMENT",
    label: "Adjustment",
  },
] as const;

// ============================================================================
// Formatting
// ============================================================================

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function formatCredits(
  value: number,
): string {
  return value.toLocaleString(
    "en-GB",
  );
}

// ============================================================================
// Component
// ============================================================================

export function FloatLedgerReport({
  clientId,
}: FloatLedgerReportProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [rows, setRows] =
    useState<
      readonly FloatLedgerReportRow[]
    >([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      pageSize: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    });

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  // ==========================================================================
  // Filters
  // ==========================================================================

  const filters =
    useMemo(
      () => ({
        page: Math.max(
          Number(
            searchParams.get(
              "page",
            ) ?? "1",
          ),
          1,
        ),

        from:
          searchParams.get(
            "from",
          ) ?? "",

        to:
          searchParams.get(
            "to",
          ) ?? "",

        transactionType:
          searchParams.get(
            "transactionType",
          ) ?? "",

        referenceType:
          searchParams.get(
            "referenceType",
          ) ?? "",
      }),
      [searchParams],
    );

  // ==========================================================================
  // Load report
  // ==========================================================================

  const loadReport =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          if (clientId) {
            const params: FindClientFloatLedgerReportParams =
            {
              page:
                filters.page,

              pageSize:
                PAGE_SIZE,

              from:
                filters.from ||
                undefined,

              to:
                filters.to ||
                undefined,

              transactionType:
                filters.transactionType ||
                undefined,

              referenceType:
                filters.referenceType ||
                undefined,
            };

            const result =
              await findClientFloatLedgerReport(
                clientId,
                params,
              );

            setRows(
              result.items,
            );

            setPagination({
              page:
                result.meta.page,

              pageSize:
                result.meta.pageSize,

              total:
                result.meta.total,

              totalPages:
                result.meta.totalPages,
            });

            return;
          }

          const params: FindFloatLedgerReportParams =
          {
            page:
              filters.page,

            pageSize:
              PAGE_SIZE,

            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,

            transactionType:
              filters.transactionType ||
              undefined,

            referenceType:
              filters.referenceType ||
              undefined,
          };

          const result =
            await findPlatformFloatLedgerReport(
              params,
            );

          setRows(
            result.items,
          );

          setPagination({
            page:
              result.meta.page,

            pageSize:
              result.meta.pageSize,

            total:
              result.meta.total,

            totalPages:
              result.meta.totalPages,
          });
        } catch (err) {
          setRows([]);

          setPagination({
            page: 1,
            pageSize: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          });

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load float ledger report.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        clientId,
        filters,
      ],
    );

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  // ==========================================================================
  // Date filters
  // ==========================================================================

  const updateDateFilter =
    useCallback(
      (
        name: "from" | "to",
        value: string,
      ) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        if (value) {
          params.set(
            name,
            value,
          );
        } else {
          params.delete(
            name,
          );
        }

        params.delete(
          "page",
        );

        router.push(
          `${pathname}?${params.toString()}`,
        );
      },
      [
        pathname,
        router,
        searchParams,
      ],
    );

  // ==========================================================================
  // Export
  // ==========================================================================

  const handleExport =
    useCallback(
      async () => {
        setExporting(true);
        setError(null);

        try {
          const params = {
            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,

            transactionType:
              filters.transactionType ||
              undefined,

            referenceType:
              filters.referenceType ||
              undefined,
          };

          const blob =
            clientId
              ? await exportClientFloatLedgerReport(
                clientId,
                params,
              )
              : await exportPlatformFloatLedgerReport(
                params,
              );

          const url =
            URL.createObjectURL(
              blob,
            );

          const anchor =
            document.createElement(
              "a",
            );

          anchor.href =
            url;

          anchor.download =
            "float-ledger-report.xlsx";

          document.body.appendChild(
            anchor,
          );

          anchor.click();

          anchor.remove();

          URL.revokeObjectURL(
            url,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to export float ledger report.",
          );
        } finally {
          setExporting(false);
        }
      },
      [
        clientId,
        filters,
      ],
    );

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<FloatLedgerReportRow>[] =
    [
      {
        key: "publicId",
        header: "Entry",
        render: (row) => (
          <div className="min-w-0">
            <span className="font-mono text-sm font-medium text-slate-900">
              {row.publicId}
            </span>

            <p className="mt-0.5 text-xs text-slate-400">
              {row.transactionType}
            </p>
          </div>
        ),
      },

      {
        key: "credits",
        header: "Credits",
        className:
          "text-right",
        render: (row) => (
          <span
            className={[
              "font-mono text-sm font-medium",
              row.credits > 0
                ? "text-emerald-700"
                : row.credits < 0
                  ? "text-red-700"
                  : "text-slate-700",
            ].join(" ")}
          >
            {row.credits > 0
              ? "+"
              : ""}
            {formatCredits(
              row.credits,
            )}
          </span>
        ),
      },

      {
        key: "reference",
        header: "Reference",
        render: (row) => (
          <div>
            <span className="text-sm text-slate-700">
              {row.referenceType}
            </span>

            {row.referenceId && (
              <p className="mt-0.5 max-w-[220px] truncate font-mono text-xs text-slate-400">
                {row.referenceId}
              </p>
            )}
          </div>
        ),
      },

      {
        key: "description",
        header: "Description",
        render: (row) => (
          <span className="block max-w-[280px] truncate text-sm text-slate-600">
            {row.description ??
              "—"}
          </span>
        ),
      },

      {
        key: "createdAt",
        header: "Date",
        render: (row) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatDate(
              row.createdAt,
            )}
          </span>
        ),
      },
    ];

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Float Ledger Report"
        description={
          clientId
            ? "View and export float ledger activity for this client."
            : "View and export float ledger activity across the platform."
        }
      >
        <button
          type="button"
          onClick={
            handleExport
          }
          disabled={
            exporting
          }
          className="
            inline-flex
            h-9
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-blue-600
            px-4
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-700
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/30
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Download className="h-4 w-4" />

          {exporting
            ? "Exporting..."
            : "Export XLSX"}
        </button>
      </PageHeader>

      {clientId && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Client Report
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Float ledger activity for the selected client.
            </p>
          </div>

          <Link
            href={`/clients/${encodeURIComponent(
              clientId,
            )}`}
            className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Back to client
          </Link>
        </div>
      )}

      <FilterBar
        resetParams={[
          "from",
          "to",
          "transactionType",
          "referenceType",
          "page",
        ]}
      >
        <FilterSelect
          name="transactionType"
          placeholder="All transactions"
          options={[
            {
              value: "",
              label: "All transactions",
            },
            ...TRANSACTION_TYPES,
          ]}
        />

        <FilterSelect
          name="referenceType"
          placeholder="All references"
          options={[
            {
              value: "",
              label: "All references",
            },
            ...REFERENCE_TYPES,
          ]}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="float-report-from"
            className="text-xs font-medium text-slate-500"
          >
            From
          </label>

          <input
            id="float-report-from"
            type="date"
            value={
              filters.from
            }
            onChange={(event) =>
              updateDateFilter(
                "from",
                event.target.value,
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-700
              outline-none
              transition
              hover:border-slate-300
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          />

          <label
            htmlFor="float-report-to"
            className="text-xs font-medium text-slate-500"
          >
            To
          </label>

          <input
            id="float-report-to"
            type="date"
            value={
              filters.to
            }
            onChange={(event) =>
              updateDateFilter(
                "to",
                event.target.value,
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-700
              outline-none
              transition
              hover:border-slate-300
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          />
        </div>
      </FilterBar>

      {error && (
        <div
          role="alert"
          className="
            mt-4
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
            Loading report...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No float ledger entries found"
            description="There are no ledger entries matching the current filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={rows}
            getRowKey={(row) =>
              row.publicId
            }
          />
        )}
      </div>

      {pagination.total > 0 && (
        <div className="mt-4">
          <Pagination
            meta={{
              page:
                pagination.page,

              pageSize:
                pagination.pageSize,

              total:
                pagination.total,

              totalPages:
                pagination.totalPages,
            }}
          />
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================================
// Transaction badge
// ============================================================================

function TransactionBadge({
  transactionType,
}: {
  readonly transactionType: string;
}) {
  const configuration:
    Record<
      string,
      {
        readonly label: string;
        readonly tone:
        | "success"
        | "warning"
        | "danger"
        | "info"
        | "neutral";
      }
    > = {
    TOPUP: {
      label: "Top-up",
      tone: "success",
    },

    DEBIT: {
      label: "Debit",
      tone: "danger",
    },

    REFUND: {
      label: "Refund",
      tone: "info",
    },

    ADJUSTMENT: {
      label: "Adjustment",
      tone: "warning",
    },
  };

  const item =
    configuration[
    transactionType
    ] ??
    {
      label: transactionType,
      tone: "neutral" as const,
    };

  return (
    <StatusBadge
      tone={item.tone}
      dot
    >
      {item.label}
    </StatusBadge>
  );
}