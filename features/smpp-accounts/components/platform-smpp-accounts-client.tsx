"use client";

import Link from "next/link";

import type {
  PlatformSmppAccount,
  SmppAccountPagination,
} from "@/features/smpp-accounts/api/smpp-accounts-api";

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
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

// ============================================================================
// Props
// ============================================================================

interface PlatformSmppAccountsClientProps {
  readonly smppAccounts: readonly PlatformSmppAccount[];

  readonly pagination: SmppAccountPagination;
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformSmppAccountsClient({
  smppAccounts,
  pagination,
}: PlatformSmppAccountsClientProps) {
  const columns: DataTableColumn<PlatformSmppAccount>[] =
    [
      {
        key: "systemId",

        header: "System ID",

        render: (account) => (
          <Link
            href={`/clients/${account.client.id}/smpp-accounts/${account.id}`}
            className="font-medium text-slate-900 hover:text-slate-600"
          >
            {account.systemId}
          </Link>
        ),
      },

      {
        key: "client",

        header: "Client",

        render: (account) => {
          const clientName =
            account.client.displayName ||
            account.client.companyName;

          return (
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900">
                {clientName}
              </div>

              <div className="font-mono text-xs text-slate-500">
                {account.client.publicId}
              </div>
            </div>
          );
        },
      },

      {
        key: "publicId",

        header: "Public ID",

        render: (account) => (
          <span className="font-mono text-xs text-slate-600">
            {account.publicId}
          </span>
        ),
      },

      {
        key: "status",

        header: "Status",

        render: (account) => (
          <SmppAccountStatusBadge
            status={account.status}
          />
        ),
      },

      {
        key: "maxConcurrentBinds",

        header: "Concurrent Binds",

        render: (account) =>
          account.maxConcurrentBinds,
      },

      {
        key: "enquireLinkInterval",

        header: "Enquire Link",

        render: (account) => (
          <span>
            {account.enquireLinkInterval}s
          </span>
        ),
      },

      {
        key: "createdAt",

        header: "Created",

        render: (account) =>
          formatDate(
            account.createdAt,
          ),
      },

      {
        key: "actions",

        header: "",

        className:
          "w-[1%] whitespace-nowrap text-right",

        render: (account) => (
          <Link
            href={`/clients/${account.client.id}/smpp-accounts/${account.id}`}
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
        title="SMPP Accounts"
        description="SMPP accounts across all clients."
      />

      {smppAccounts.length === 0 ? (
        <EmptyState
          title="No SMPP accounts"
          description="No SMPP accounts match the current filters."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={smppAccounts}
            getRowKey={(account) =>
              account.id
            }
            onRowClick={(account) => {
              window.location.href =
                `/clients/${account.client.id}/smpp-accounts/${account.id}`;
            }}
          />

          <Pagination
            meta={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.totalItems,
              totalPages: pagination.totalPages,
            }}
          />
        </>
      )}
    </PageContainer>
  );
}

// ============================================================================
// Status
// ============================================================================

function SmppAccountStatusBadge({
  status,
}: {
  readonly status: PlatformSmppAccount["status"];
}) {
  switch (status) {
    case "ACTIVE":
      return (
        <StatusBadge
          tone="success"
          dot
        >
          Active
        </StatusBadge>
      );

    case "DISABLED":
      return (
        <StatusBadge
          tone="neutral"
          dot
        >
          Disabled
        </StatusBadge>
      );

    case "SUSPENDED":
      return (
        <StatusBadge
          tone="warning"
          dot
        >
          Suspended
        </StatusBadge>
      );
  }
}

// ============================================================================
// Formatting
// ============================================================================

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    },
  ).format(new Date(value));
}