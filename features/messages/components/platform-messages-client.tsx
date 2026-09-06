"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  DataTable,
  DataTableColumn,
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
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  Message,
  MessageStatus,
  PaginationMeta,
} from "@/features/messages/api/messages-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface PlatformMessagesClientProps {
  readonly messages: Message[];

  readonly pagination: PaginationMeta;
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformMessagesClient({
  messages,
  pagination,
}: PlatformMessagesClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<Message>[] =
    [
      {
        key: "publicId",
        header: "Message",
        render: (message) => (
          <div className="min-w-0">
            <Link
              href={`/messages/${encodeURIComponent(
                message.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="font-mono text-sm font-medium text-slate-900 transition hover:text-blue-600"
            >
              {message.publicId}
            </Link>

            <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
              {message.body}
            </p>
          </div>
        ),
      },

      {
        key: "clientId",
        header: "Client",
        render: (message) => {
          const clientName =
            message.client.displayName ||
            message.client.companyName;

          return (
            <Link
              href={`/clients/${encodeURIComponent(
                message.client.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
            >
              {clientName}
            </Link>
          );
        },
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
        key: "encoding",
        header: "Encoding",
        render: (message) => (
          <span className="text-sm text-slate-600">
            {message.encoding}
          </span>
        ),
      },

      {
        key: "segments",
        header: "Segments",
        className:
          "text-right",
        render: (message) => (
          <span className="text-sm text-slate-700">
            {message.segmentCount}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (message) => (
          <MessageStatusBadge
            status={
              message.currentStatus
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
      {/* ====================================================================
          Header
      ===================================================================== */}

      <PageHeader
        title="Messages"
        description="View and monitor messages across the platform."
      />

      {/* ====================================================================
          Platform context
      ===================================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Platform
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            All clients
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Showing messages across the platform. Use the filters below to
            narrow the results.
          </p>
        </div>
      </div>

      {/* ====================================================================
          Filters
      ===================================================================== */}

      <FilterBar
        resetParams={[
          "clientId",
          "status",
          "encoding",
          "search",
          "destination",
          "senderIdId",
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
          name="clientId"
          placeholder="Client ID..."
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
          ]}
        />

        <FilterSelect
          name="encoding"
          options={[
            {
              value: "",
              label: "All encodings",
            },
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
          ]}
        />
      </FilterBar>

      {/* ====================================================================
          Table
      ===================================================================== */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {messages.length === 0 ? (
          <EmptyState
            title="No messages found"
            description="There are no messages matching the current filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              messages
            }
            getRowKey={(message) =>
              message.id
            }
            onRowClick={(
              message,
            ) =>
              router.push(
                `/clients/${message.clientId}/messages/${encodeURIComponent(
                  message.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* ====================================================================
          Pagination
      ===================================================================== */}

      {pagination.total > 0 && (
        <div className="mt-4">
          <Pagination
            meta={pagination}
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
  readonly status: MessageStatus;
}) {
  const configuration:
    Record<
      MessageStatus,
      {
        label: string;
        tone:
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