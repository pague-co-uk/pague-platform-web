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
  ClientActionSelector,
} from "@/components/ui/client-action-selector";

import {
  formatDate,
} from "@/lib/date/format-date";

import type {
  PaginationMeta,
  SenderId,
  SenderIdStatus,
} from "@/features/sender-ids/api/sender-ids-api";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface SenderIdsClientProps {
  readonly senderIds: SenderId[];

  readonly pagination: PaginationMeta;

  readonly canCreateSenderIds: boolean;

  readonly clients: readonly ClientSummary[];
}

// ============================================================================
// Component
// ============================================================================

export default function SenderIdsClient({
  senderIds,
  pagination,
  canCreateSenderIds,
  clients,
}: SenderIdsClientProps) {
  const router =
    useRouter();

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
                senderId.clientId,
              )}/sender-ids/${encodeURIComponent(
                senderId.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="text-sm font-medium text-slate-900 transition hover:text-blue-600"
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
        key: "clientId",
        header: "Client",
        render: (senderId) => (
          <Link
            href={`/clients/${encodeURIComponent(
              senderId.clientId,
            )}/sender-ids`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            {senderId.client.displayName}
          </Link>
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
      <PageHeader
        title="Sender IDs"
        description="View and manage Sender IDs across the platform."
      >
        {canCreateSenderIds && (
          <ClientActionSelector
            clients={clients}
            actions={[
              {
                label:
                  "Create Sender ID",
                href: (
                  clientId,
                ) =>
                  `/clients/${encodeURIComponent(
                    clientId,
                  )}/sender-ids/new`,
                variant:
                  "primary",
              },
            ]}
          />
        )}
      </PageHeader>

      <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Platform
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          All clients
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Showing Sender IDs across the platform. Use the filters below to
          narrow the results.
        </p>
      </div>

      <FilterBar
        resetParams={[
          "clientId",
          "status",
          "search",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search Sender IDs..."
        />

        <FilterSearch
          name="clientId"
          placeholder="Client ID..."
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
      </FilterBar>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {senderIds.length === 0 ? (
          <EmptyState
            title="No Sender IDs found"
            description="There are no Sender IDs matching the current filters."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={senderIds}
            getRowKey={(senderId) =>
              senderId.id
            }
            onRowClick={(
              senderId,
            ) =>
              router.push(
                `/clients/${encodeURIComponent(
                  senderId.clientId,
                )}/sender-ids/${encodeURIComponent(
                  senderId.id,
                )}`,
              )
            }
          />
        )}
      </div>

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
        | "neutral";
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