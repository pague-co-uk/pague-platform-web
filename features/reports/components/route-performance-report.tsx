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

import {
  exportClientRoutePerformanceReport,
  exportPlatformRoutePerformanceReport,
  findClientRoutePerformanceReport,
  findPlatformRoutePerformanceReport,
  type FindClientRoutePerformanceReportParams,
  type FindRoutePerformanceReportParams,
} from "../api/reports-api";

import type {
  RoutePerformanceReportRow,
} from "../types/report-types";

// ============================================================================
// Types
// ============================================================================

interface RoutePerformanceReportProps {
  readonly clientId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25;

const STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "SUBMITTED",
    label: "Submitted",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
] as const;

// ============================================================================
// Component
// ============================================================================

export function RoutePerformanceReport({
  clientId,
}: RoutePerformanceReportProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [rows, setRows] =
    useState<readonly RoutePerformanceReportRow[]>(
      [],
    );

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
    useState<string | null>(null);

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

        routeId:
          searchParams.get(
            "routeId",
          ) ?? "",

        connectorId:
          searchParams.get(
            "connectorId",
          ) ?? "",

        status:
          searchParams.get(
            "status",
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
            const params: FindClientRoutePerformanceReportParams =
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

              routeId:
                filters.routeId ||
                undefined,

              connectorId:
                filters.connectorId ||
                undefined,

              status:
                filters.status ||
                undefined,
            };

            const result =
              await findClientRoutePerformanceReport(
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

          const params: FindRoutePerformanceReportParams =
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

            routeId:
              filters.routeId ||
              undefined,

            connectorId:
              filters.connectorId ||
              undefined,

            status:
              filters.status ||
              undefined,
          };

          const result =
            await findPlatformRoutePerformanceReport(
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
              : "Unable to load route performance report.",
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

            routeId:
              filters.routeId ||
              undefined,

            connectorId:
              filters.connectorId ||
              undefined,

            status:
              filters.status ||
              undefined,
          };

          const blob =
            clientId
              ? await exportClientRoutePerformanceReport(
                clientId,
                params,
              )
              : await exportPlatformRoutePerformanceReport(
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
            "route-performance-report.xlsx";

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
              : "Unable to export route performance report.",
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
    DataTableColumn<RoutePerformanceReportRow>[] =
    [
      {
        key: "publicId",
        header: "Route",
        render: (row) => (
          <span className="font-mono text-sm font-medium text-slate-900">
            {row.publicId}
          </span>
        ),
      },

      {
        key: "connectorName",
        header: "Connector",
        render: (row) => (
          <span className="text-sm text-slate-700">
            {row.connectorName}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (row) => (
          <RouteStatusBadge
            status={
              row.status
            }
          />
        ),
      },

      {
        key: "attempts",
        header: "Attempts",
        className: "text-right",
        render: (row) => (
          <span className="text-sm text-slate-700">
            {row.attempts.toLocaleString(
              "en-GB",
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
        title="Route Performance Report"
        description={
          clientId
            ? "View and export routing performance for this client."
            : "View and export routing performance across the platform."
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
              Route performance for the selected client.
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
          "routeId",
          "connectorId",
          "status",
          "page",
        ]}
      >
        <FilterSearch
          name="routeId"
          placeholder="Route ID..."
        />

        <FilterSearch
          name="connectorId"
          placeholder="Connector ID..."
        />

        <FilterSelect
          name="status"
          placeholder="All statuses"
          options={[
            {
              value: "",
              label: "All statuses",
            },
            ...STATUSES,
          ]}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="route-report-from"
            className="text-xs font-medium text-slate-500"
          >
            From
          </label>

          <input
            id="route-report-from"
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
            htmlFor="route-report-to"
            className="text-xs font-medium text-slate-500"
          >
            To
          </label>

          <input
            id="route-report-to"
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
            title="No route performance data found"
            description="There is no route performance data matching the current filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={rows}
            getRowKey={(row) =>
              `${row.publicId}-${row.connectorName}-${row.status}`
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
// Status badge
// ============================================================================

function RouteStatusBadge({
  status,
}: {
  readonly status: string;
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
    PENDING: {
      label: "Pending",
      tone: "info",
    },

    SUBMITTED: {
      label: "Submitted",
      tone: "warning",
    },

    FAILED: {
      label: "Failed",
      tone: "danger",
    },
  };

  const item =
    configuration[status] ??
    {
      label: status,
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