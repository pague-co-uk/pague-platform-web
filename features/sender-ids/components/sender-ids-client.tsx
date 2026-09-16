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

import {
  formatDate,
} from "@/lib/date/format-date";

import type {
  SenderId,
  SenderIdStatus,
} from "@/features/sender-ids/api/sender-ids-api";

import type {
  FindSenderIdsResult,
} from "@/features/sender-ids/api/sender-ids-api";

// ============================================================================
// Types
// ============================================================================

interface SenderIdsClientProps {
  readonly clientId: string;

  readonly initialSenderIds:
  | FindSenderIdsResult
  | null;

  readonly canCreateSenderIds: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function SenderIdsClient({
  clientId,
  initialSenderIds,
  canCreateSenderIds,
}: SenderIdsClientProps) {
  const router =
    useRouter();

  const senderIds =
    initialSenderIds?.items ?? [];

  const pagination =
    initialSenderIds?.meta ?? {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    };

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<SenderId>[] =
    [
      {
        key: "sender",
        header: "Sender ID",
        render: (senderId) => (
          <div className="min-w-0">
            <Link
              href={`/clients/${encodeURIComponent(
                clientId,
              )}/sender-ids/${encodeURIComponent(
                senderId.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="text-sm font-semibold text-slate-900 transition hover:text-blue-600"
            >
              {senderId.sender}
            </Link>

            <p className="mt-0.5 font-mono text-xs text-slate-400">
              {senderId.publicId}
            </p>
          </div>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (senderId) => (
          <SenderIdStatusBadge
            status={
              senderId.status
            }
          />
        ),
      },

      {
        key: "isDefault",
        header: "Default",
        render: (senderId) =>
          senderId.isDefault ? (
            <StatusBadge
              tone="info"
              dot={false}
            >
              Default
            </StatusBadge>
          ) : (
            <span className="text-sm text-slate-400">
              No
            </span>
          ),
      },

      {
        key: "createdAt",
        header: "Created",
        render: (senderId) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatDate(
              senderId.createdAt,
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
        title="Sender IDs"
        description="View and manage Sender IDs for this client."
      >
        {canCreateSenderIds && (
          <Link
            href={`/clients/${encodeURIComponent(
              clientId,
            )}/sender-ids/new`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add Sender ID
          </Link>
        )}
      </PageHeader>

      {/* ====================================================================
          Client context
      ===================================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Client
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          Sender IDs
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Showing Sender IDs registered for this client.
        </p>
      </div>

      {/* ====================================================================
          Filters
      ===================================================================== */}

      <FilterBar
        resetParams={[
          "status",
          "search",
          "sender",
          "isDefault",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search Sender IDs..."
        />

        <FilterSearch
          name="sender"
          placeholder="Sender..."
        />

        <FilterSelect
          name="status"
          options={[
            {
              value: "",
              label: "All statuses",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "APPROVED",
              label: "Approved",
            },
            {
              value: "REJECTED",
              label: "Rejected",
            },
            {
              value: "DISABLED",
              label: "Disabled",
            },
          ]}
        />

        <FilterSelect
          name="isDefault"
          options={[
            {
              value: "",
              label: "All Sender IDs",
            },
            {
              value: "true",
              label: "Default only",
            },
            {
              value: "false",
              label: "Non-default",
            },
          ]}
        />
      </FilterBar>

      {/* ====================================================================
          Table
      ===================================================================== */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {initialSenderIds === null ? (
          <EmptyState
            title="Unable to load Sender IDs"
            description="The Sender IDs could not be loaded. Please try again."
          />
        ) : senderIds.length === 0 ? (
          <EmptyState
            title="No Sender IDs found"
            description="This client does not have any Sender IDs matching the current filters."
          />
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              senderIds
            }
            getRowKey={(senderId) =>
              senderId.id
            }
            onRowClick={(
              senderId,
            ) =>
              router.push(
                `/clients/${encodeURIComponent(
                  clientId,
                )}/sender-ids/${encodeURIComponent(
                  senderId.id,
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
            meta={
              pagination
            }
          />
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function SenderIdStatusBadge({
  status,
}: {
  readonly status: SenderIdStatus;
}) {
  const configuration:
    Record<
      SenderIdStatus,
      {
        label: string;
        tone:
        | "success"
        | "warning"
        | "danger"
        | "neutral"
        | "info";
      }
    > = {
    PENDING: {
      label: "Pending",
      tone: "warning",
    },

    APPROVED: {
      label: "Approved",
      tone: "success",
    },

    REJECTED: {
      label: "Rejected",
      tone: "danger",
    },

    DISABLED: {
      label: "Disabled",
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