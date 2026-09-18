"use client";

import { AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import {
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
  exportClientMessageReport,
  exportPlatformMessageReport,
  findClientMessageReport,
  findPlatformMessageReport,
  type FindClientMessageReportParams,
  type FindMessageReportParams,
} from "../api/reports-api";

import type {
  MessageReportRow,
} from "../types/report-types";

// ============================================================================
// Types
// ============================================================================

interface MessageReportProps {
  readonly clientId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25;

const MESSAGE_STATUSES = [
  {
    value: "QUEUED",
    label: "Queued",
  },
  {
    value: "ROUTED",
    label: "Routed",
  },
  {
    value: "SUBMITTED",
    label: "Submitted",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "EXPIRED",
    label: "Expired",
  },
] as const;

const MESSAGE_ENCODINGS = [
  {
    value: "GSM7",
    label: "GSM-7",
  },
  {
    value: "UCS2",
    label: "UCS-2",
  },
  {
    value: "BINARY",
    label: "Binary",
  },
] as const;

// ============================================================================
// Component
// ============================================================================

export function MessageReport({
  clientId,
}: MessageReportProps) {
  const searchParams =
    useSearchParams();

  const [rows, setRows] =
    useState<readonly MessageReportRow[]>(
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
    useMemo(() => {
      return {
        page: Number(
          searchParams.get("page") ??
          "1",
        ),

        search:
          searchParams.get(
            "search",
          ) ?? "",

        destination:
          searchParams.get(
            "destination",
          ) ?? "",

        status:
          searchParams.get(
            "status",
          ) ?? "",

        encoding:
          searchParams.get(
            "encoding",
          ) ?? "",

        submittedFrom:
          searchParams.get(
            "submittedFrom",
          ) ?? "",

        submittedTo:
          searchParams.get(
            "submittedTo",
          ) ?? "",
      };
    }, [searchParams]);

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
            const params: FindClientMessageReportParams =
            {
              page:
                filters.page > 0
                  ? filters.page
                  : 1,

              pageSize:
                PAGE_SIZE,

              search:
                filters.search ||
                undefined,

              destination:
                filters.destination ||
                undefined,

              status:
                filters.status ||
                undefined,

              encoding:
                filters.encoding ||
                undefined,

              submittedFrom:
                filters.submittedFrom ||
                undefined,

              submittedTo:
                filters.submittedTo ||
                undefined,
            };

            const result =
              await findClientMessageReport(
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

          const params: FindMessageReportParams =
          {
            page:
              filters.page > 0
                ? filters.page
                : 1,

            pageSize:
              PAGE_SIZE,

            search:
              filters.search ||
              undefined,

            destination:
              filters.destination ||
              undefined,

            status:
              filters.status ||
              undefined,

            encoding:
              filters.encoding ||
              undefined,

            submittedFrom:
              filters.submittedFrom ||
              undefined,

            submittedTo:
              filters.submittedTo ||
              undefined,
          };

          const result =
            await findPlatformMessageReport(
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
              : "Unable to load message report.",
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
  // Export
  // ==========================================================================

  const handleExport =
    useCallback(
      async () => {
        setExporting(true);
        setError(null);

        try {
          const params = {
            search:
              filters.search ||
              undefined,

            destination:
              filters.destination ||
              undefined,

            status:
              filters.status ||
              undefined,

            encoding:
              filters.encoding ||
              undefined,

            submittedFrom:
              filters.submittedFrom ||
              undefined,

            submittedTo:
              filters.submittedTo ||
              undefined,
          };

          const blob =
            clientId
              ? await exportClientMessageReport(
                clientId,
                params,
              )
              : await exportPlatformMessageReport(
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
            "message-report.xlsx";

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
              : "Unable to export message report.",
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
    DataTableColumn<MessageReportRow>[] =
    [
      {
        key: "publicId",
        header: "Message",
        render: (message) => (
          <div className="min-w-0">
            <span className="font-mono text-sm font-medium text-slate-900">
              {message.publicId}
            </span>

            <p className="mt-0.5 text-xs text-slate-400">
              {message.segmentCount}{" "}
              {message.segmentCount === 1
                ? "segment"
                : "segments"}
            </p>
          </div>
        ),
      },

      {
        key: "destination",
        header: "Destination",
        render: (message) => (
          <span className="font-mono text-sm text-slate-700">
            {message.destination}
          </span>
        ),
      },

      {
        key: "sender",
        header: "Sender",
        render: (message) => (
          <span className="text-sm text-slate-600">
            {message.sender ?? "—"}
          </span>
        ),
      },

      {
        key: "encoding",
        header: "Encoding",
        render: (message) => (
          <span className="text-sm text-slate-600">
            {message.encoding}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (message) => (
          <MessageStatusBadge
            status={
              message.status
            }
          />
        ),
      },

      {
        key: "submittedAt",
        header: "Submitted",
        render: (message) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatDate(
              message.submittedAt,
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
        title="Message Report"
        description={
          clientId
            ? "View and export message activity for this client."
            : "View and export message activity across the platform."
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
              Message activity for the selected client.
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
          "destination",
          "status",
          "encoding",
          "submittedFrom",
          "submittedTo",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search messages..."
        />

        <FilterSearch
          name="destination"
          placeholder="Destination..."
        />

        <FilterSelect
          name="status"
          options={[
            {
              value: "",
              label: "All statuses",
            },
            ...MESSAGE_STATUSES,
          ]}
          placeholder="All statuses"
        />

        <FilterSelect
          name="encoding"
          options={[
            {
              value: "",
              label: "All encodings",
            },
            ...MESSAGE_ENCODINGS,
          ]}
          placeholder="All encodings"
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="message-report-from"
            className="text-xs font-medium text-slate-500"
          >
            From
          </label>

          <input
            id="message-report-from"
            type="date"
            defaultValue={
              filters.submittedFrom
            }
            onChange={() => {
              /*
               * Date filters are intentionally handled below
               * through the URL so they follow the same
               * FilterBar convention as the other filters.
               */
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <label
            htmlFor="message-report-to"
            className="text-xs font-medium text-slate-500"
          >
            To
          </label>

          <input
            id="message-report-to"
            type="date"
            defaultValue={
              filters.submittedTo
            }
            onChange={() => {
              /*
               * Date filters are intentionally handled below
               * through the URL so they follow the same
               * FilterBar convention as the other filters.
               */
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </FilterBar>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
            title="No messages found"
            description="There are no messages matching the current report filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={rows}
            getRowKey={(message) =>
              message.publicId
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

function MessageStatusBadge({
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
    QUEUED: {
      label: "Queued",
      tone: "info",
    },

    ROUTED: {
      label: "Routed",
      tone: "info",
    },

    SUBMITTED: {
      label: "Submitted",
      tone: "warning",
    },

    DELIVERED: {
      label: "Delivered",
      tone: "success",
    },

    FAILED: {
      label: "Failed",
      tone: "danger",
    },

    EXPIRED: {
      label: "Expired",
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

// ============================================================================
// Date formatting
// ============================================================================

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

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