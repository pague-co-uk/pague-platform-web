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
  FilterSearch,
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



import { exportClientTransactionReport, exportPlatformTransactionReport, findClientTransactionReport, FindClientTransactionReportParams, findPlatformTransactionReport, FindTransactionReportParams } from "../api/reports-api";
import type {
  TransactionReportRow,
  TransactionStatus,
} from "../types/report-types";

// ============================================================================
// Types
// ============================================================================

interface TransactionReportProps {
  readonly clientId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25;

const TRANSACTION_STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "PROCESSING",
    label: "Processing",
  },
  {
    value: "SUCCESS",
    label: "Successful",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "REVERSED",
    label: "Reversed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
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

function formatAmount(
  row: TransactionReportRow,
): string {
  const numericValue =
    Number(row.amount);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return row.amount;
  }

  return new Intl.NumberFormat(
    "en-GB",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    },
  ).format(numericValue);
}

// ============================================================================
// Status badge
// ============================================================================

function TransactionStatusBadge({
  status,
}: {
  readonly status: TransactionStatus;
}) {
  const configuration: Record<
    TransactionStatus,
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
    PENDING: {
      label: "Pending",
      tone: "warning",
    },

    PROCESSING: {
      label: "Processing",
      tone: "info",
    },

    SUCCESS: {
      label: "Successful",
      tone: "success",
    },

    FAILED: {
      label: "Failed",
      tone: "danger",
    },

    REVERSED: {
      label: "Reversed",
      tone: "warning",
    },

    CANCELLED: {
      label: "Cancelled",
      tone: "neutral",
    },
  };

  const item =
    configuration[status];

  return (
    <StatusBadge
      tone={item.tone}
      dot
    >
      {item.label}
    </StatusBadge>
  );
}

// ============================================================================
// Component
// ============================================================================

export function TransactionReport({
  clientId,
}: TransactionReportProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    rows,
    setRows,
  ] = useState<
    readonly TransactionReportRow[]
  >([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
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

        search:
          searchParams.get(
            "search",
          ) ?? "",

        clientId:
          searchParams.get(
            "clientId",
          ) ?? "",

        clientServiceId:
          searchParams.get(
            "clientServiceId",
          ) ?? "",

        providerId:
          searchParams.get(
            "providerId",
          ) ?? "",

        providerServiceId:
          searchParams.get(
            "providerServiceId",
          ) ?? "",

        currencyId:
          searchParams.get(
            "currencyId",
          ) ?? "",

        transactionTypeId:
          searchParams.get(
            "transactionTypeId",
          ) ?? "",

        status:
          searchParams.get(
            "status",
          ) ?? "",

        from:
          searchParams.get(
            "from",
          ) ?? "",

        to:
          searchParams.get(
            "to",
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
            const params:
              FindClientTransactionReportParams =
            {
              page:
                filters.page,

              pageSize:
                PAGE_SIZE,

              search:
                filters.search ||
                undefined,

              clientServiceId:
                filters.clientServiceId ||
                undefined,

              providerId:
                filters.providerId ||
                undefined,

              providerServiceId:
                filters.providerServiceId ||
                undefined,

              currencyId:
                filters.currencyId ||
                undefined,

              transactionTypeId:
                filters.transactionTypeId ||
                undefined,

              status:
                filters.status ||
                undefined,

              from:
                filters.from ||
                undefined,

              to:
                filters.to ||
                undefined,
            };

            const result =
              await findClientTransactionReport(
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

          const params:
            FindTransactionReportParams =
          {
            page:
              filters.page,

            pageSize:
              PAGE_SIZE,

            search:
              filters.search ||
              undefined,

            clientId:
              filters.clientId ||
              undefined,

            clientServiceId:
              filters.clientServiceId ||
              undefined,

            providerId:
              filters.providerId ||
              undefined,

            providerServiceId:
              filters.providerServiceId ||
              undefined,

            currencyId:
              filters.currencyId ||
              undefined,

            transactionTypeId:
              filters.transactionTypeId ||
              undefined,

            status:
              filters.status ||
              undefined,

            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,
          };

          const result =
            await findPlatformTransactionReport(
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
              : "Unable to load transaction report.",
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
        name:
          | "from"
          | "to",
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
          if (clientId) {
            const params:
              FindClientTransactionReportParams =
            {
              search:
                filters.search ||
                undefined,

              clientServiceId:
                filters.clientServiceId ||
                undefined,

              providerId:
                filters.providerId ||
                undefined,

              providerServiceId:
                filters.providerServiceId ||
                undefined,

              currencyId:
                filters.currencyId ||
                undefined,

              transactionTypeId:
                filters.transactionTypeId ||
                undefined,

              status:
                filters.status ||
                undefined,

              from:
                filters.from ||
                undefined,

              to:
                filters.to ||
                undefined,
            };

            const blob =
              await exportClientTransactionReport(
                clientId,
                params,
              );

            thisDownload(
              blob,
              "transaction-report.xlsx",
            );

            return;
          }

          const params:
            FindTransactionReportParams =
          {
            clientId:
              filters.clientId ||
              undefined,

            search:
              filters.search ||
              undefined,

            clientServiceId:
              filters.clientServiceId ||
              undefined,

            providerId:
              filters.providerId ||
              undefined,

            providerServiceId:
              filters.providerServiceId ||
              undefined,

            currencyId:
              filters.currencyId ||
              undefined,

            transactionTypeId:
              filters.transactionTypeId ||
              undefined,

            status:
              filters.status ||
              undefined,

            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,
          };

          const blob =
            await exportPlatformTransactionReport(
              params,
            );

          thisDownload(
            blob,
            "transaction-report.xlsx",
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to export transaction report.",
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
    DataTableColumn<TransactionReportRow>[] =
    [
      {
        key: "transaction",
        header: "Transaction",
        render: (row) => (
          <div className="min-w-0">
            <span className="font-mono text-sm font-medium text-slate-900">
              {row.publicId}
            </span>

            <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
              {row.reference}
            </p>
          </div>
        ),
      },

      {
        key: "client",
        header: "Client",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {row.clientName}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {row.serviceCode} · {row.serviceName}
            </p>
          </div>
        ),
      },

      {
        key: "provider",
        header: "Provider",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-700">
              {row.providerName ??
                row.providerCode ??
                "—"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {row.providerServiceExternalCode ??
                row.providerServiceCode ??
                "No provider service"}
            </p>
          </div>
        ),
      },

      {
        key: "type",
        header: "Type",
        render: (row) => (
          <span className="text-sm text-slate-700">
            {row.transactionTypeName}
          </span>
        ),
      },

      {
        key: "amount",
        header: "Amount",
        className: "text-right",
        render: (row) => (
          <div className="text-right">
            <p className="font-mono text-sm font-medium text-slate-900">
              {row.currencySymbol ?? row.currencyCode}{" "}
              {formatAmount(row)}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {row.currencyCode}
            </p>
          </div>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (row) => (
          <TransactionStatusBadge
            status={row.status}
          />
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
        title="Transaction Report"
        description={
          clientId
            ? "View and export payment transaction activity for this client."
            : "View and export payment transaction activity across the platform."
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
              Transaction activity for the selected client.
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
          "search",
          "clientId",
          "clientServiceId",
          "providerId",
          "providerServiceId",
          "currencyId",
          "transactionTypeId",
          "status",
          "from",
          "to",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search transaction, reference..."
        />

        <FilterSelect
          name="status"
          options={[
            {
              value: "",
              label: "All statuses",
            },
            ...TRANSACTION_STATUSES,
          ]}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="transaction-report-from"
            className="text-xs font-medium text-slate-500"
          >
            From
          </label>

          <input
            id="transaction-report-from"
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
            htmlFor="transaction-report-to"
            className="text-xs font-medium text-slate-500"
          >
            To
          </label>

          <input
            id="transaction-report-to"
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
            title="No transactions found"
            description="There are no transactions matching the current filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              rows
            }
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
// Download helper
// ============================================================================

function thisDownload(
  blob: Blob,
  filename: string,
): void {
  const url =
    URL.createObjectURL(
      blob,
    );

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = url;
  anchor.download =
    filename;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    url,
  );
}