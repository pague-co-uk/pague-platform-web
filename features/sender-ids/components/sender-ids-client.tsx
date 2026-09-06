"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  ErrorState,
} from "@/components/ui/error-state";

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

import { formatDate } from "@/lib/date/format-date";

import type {
  FindSenderIdsResult,
  SenderId,
  SenderIdStatus,
} from "../api/sender-ids-api";

// ============================================================================
// Types
// ============================================================================

interface SenderIdsClientProps {
  clientId: string;

  initialSenderIds:
  | FindSenderIdsResult
  | null;

  canCreateSenderIds: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const statusOptions = [
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
] as const;

// ============================================================================
// Sender IDs client
// ============================================================================

export default function SenderIdsClient({
  clientId,
  initialSenderIds,
  canCreateSenderIds,
}: SenderIdsClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Navigation
  // ==========================================================================

  function openSenderId(
    senderIdId: string,
  ) {
    router.push(
      `/clients/${encodeURIComponent(
        clientId,
      )}/sender-ids/${encodeURIComponent(
        senderIdId,
      )}`,
    );
  }

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns: DataTableColumn<SenderId>[] = [
    {
      key: "sender",
      header: "Sender ID",
      render: (senderId: SenderId) => (
        <div>
          <div className="font-medium">
            {senderId.sender}
          </div>

          <div className="text-xs text-slate-500">
            {senderId.publicId}
          </div>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (senderId: SenderId) => (
        <StatusBadge
          tone={getStatusTone(
            senderId.status,
          )}
        >
          {formatStatus(
            senderId.status,
          )}
        </StatusBadge>
      ),
    },

    {
      key: "isDefault",
      header: "Default",
      render: (senderId: SenderId) =>
        senderId.isDefault ? (
          <StatusBadge
            tone="info"
            dot={false}
          >
            Default
          </StatusBadge>
        ) : (
          <span className="text-sm text-slate-400">
            —
          </span>
        ),
    },

    {
      key: "createdAt",
      header: "Created",
      render: (senderId: SenderId) =>
        formatDate(
          senderId.createdAt,
        ),
    },
  ];

  // ==========================================================================
  // Error state
  // ==========================================================================

  if (!initialSenderIds) {
    return (
      <PageContainer>
        <PageHeader
          title="Sender IDs"
          description="Manage SMS Sender IDs and their approval status."
        />

        <ErrorState
          title="Unable to load Sender IDs"
          description="Something went wrong while loading Sender IDs. Please try again."
        />
      </PageContainer>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Sender IDs"
        description="Manage SMS Sender IDs and their approval status."
      >
        {canCreateSenderIds && (
          <Link
            href={`/clients/${encodeURIComponent(
              clientId,
            )}/sender-ids/new`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Create Sender ID
          </Link>
        )}
      </PageHeader>

      <div className="space-y-6">
        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search Sender IDs..."
          />

          <FilterSearch
            name="sender"
            placeholder="Filter by sender..."
          />

          <FilterSelect
            name="status"
            options={
              statusOptions
            }
            placeholder="All statuses"
          />
        </FilterBar>

        <DataTable
          columns={
            columns
          }
          rows={
            initialSenderIds.items
          }
          getRowKey={(
            senderId: SenderId,
          ) =>
            senderId.id
          }
          onRowClick={(
            senderId: SenderId,
          ) =>
            openSenderId(
              senderId.id,
            )
          }
        />

        <Pagination
          meta={
            initialSenderIds.meta
          }
        />
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Status helpers
// ============================================================================

function getStatusTone(
  status: SenderIdStatus,
) {
  switch (status) {
    case "APPROVED":
      return "success" as const;

    case "PENDING":
      return "warning" as const;

    case "REJECTED":
      return "danger" as const;

    case "DISABLED":
      return "neutral" as const;
  }
}

function formatStatus(
  status: SenderIdStatus,
): string {
  switch (status) {
    case "APPROVED":
      return "Approved";

    case "PENDING":
      return "Pending";

    case "REJECTED":
      return "Rejected";

    case "DISABLED":
      return "Disabled";
  }
}