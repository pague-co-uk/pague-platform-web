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
  Client,
} from "@/features/clients/api/clients-api";

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

interface MessagesClientProps {
  readonly client: Client;

  readonly messages: Message[];

  readonly pagination: PaginationMeta;

  readonly canCreateMessages: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function MessagesClient({
  client,
  messages,
  pagination,
  canCreateMessages,
}: MessagesClientProps) {
  const router =
    useRouter();

  const clientName =
    client.displayName ||
    client.companyName;

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<Message>[] =
    [
      {
        key: "publicId",
        header: "Message",
        render: (message) => (<div className="min-w-0">
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/messages/${encodeURIComponent(
              message.id,
            )}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="font-mono text-sm font-medium text-slate-900 transition hover:text-blue-600"
          >
            {message.publicId} </Link>


          <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
            {message.body}
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

  return (<PageContainer>
    {/* ======================================================================
Header
======================================================================= */}


    <PageHeader
      title="Messages"
      description={`View and monitor messages for ${clientName}.`}
    >
      {canCreateMessages && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/messages/bulk`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Bulk upload
          </Link>

          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/messages/new`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Send message
          </Link>
        </div>
      )}
    </PageHeader>

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
        )}`}
        className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        Back to client
      </Link>
    </div>

    {/* ======================================================================
      Filters
  ======================================================================= */}

    <FilterBar
      resetParams={[
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

    {/* ======================================================================
      Table
  ======================================================================= */}

    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {messages.length ===
        0 ? (
        <EmptyState
          title="No messages found"
          description="There are no messages matching the current filters."
        >
          {canCreateMessages && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href={`/clients/${encodeURIComponent(
                  client.id,
                )}/messages/bulk`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Bulk upload
              </Link>

              <Link
                href={`/clients/${encodeURIComponent(
                  client.id,
                )}/messages/create`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Send message
              </Link>
            </div>
          )}
        </EmptyState>
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
              `/clients/${encodeURIComponent(
                client.id,
              )}/messages/${encodeURIComponent(
                message.id,
              )}`,
            )
          }
        />
      )}
    </div>

    {/* ======================================================================
      Pagination
  ======================================================================= */}

    {pagination.total >
      0 && (
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

  return (<StatusBadge
    tone={item.tone}
    dot
  >
    {item.label} </StatusBadge>
  );
}
