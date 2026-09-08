"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ClientActionSelector,
} from "@/components/ui/client-action-selector";

import {
  DataTable,
  type DataTableColumn,
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

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

import type {
  PlatformSmppAccount,
  SmppAccountPagination,
} from "@/features/smpp-accounts/api/smpp-accounts-api";

// ============================================================================
// Props
// ============================================================================

interface PlatformSmppAccountsClientProps {
  readonly smppAccounts: readonly PlatformSmppAccount[];

  readonly pagination: SmppAccountPagination;

  readonly canCreateSmppAccounts: boolean;

  readonly clients: readonly ClientSummary[];
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformSmppAccountsClient({
  smppAccounts,
  pagination,
  canCreateSmppAccounts,
  clients,
}: PlatformSmppAccountsClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<PlatformSmppAccount>[] =
    [
      {
        key: "systemId",

        header: "System ID",

        render: (account) => (
          <Link
            href={`/clients/${encodeURIComponent(account.client.id)}/smpp-accounts/${encodeURIComponent(account.id)}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="font-medium text-slate-900 transition hover:text-blue-600"
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
              <Link
                href={`/clients/${encodeURIComponent(account.client.id)}`}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="truncate font-medium text-slate-900 transition hover:text-blue-600"
              >
                {clientName}
              </Link>

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
            href={`/clients/${encodeURIComponent(account.client.id)}/smpp-accounts/${encodeURIComponent(account.id)}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
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
      >
        {canCreateSmppAccounts && (
          <ClientActionSelector
            clients={clients}
            actions={[
              {
                label: "Create SMPP account",
                href: (clientId) =>
                  `/clients/${encodeURIComponent(clientId)}/smpp-accounts/new`,
                variant: "primary",
              },
            ]}
          />
        )}
      </PageHeader>

      {smppAccounts.length === 0 ? (
        <EmptyState
          title="No SMPP accounts"
          description="No SMPP accounts match the current filters."
        />
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={columns}
              rows={smppAccounts}
              getRowKey={(account) =>
                account.id
              }
              onRowClick={(account) => {
                router.push(
                  `/clients/${encodeURIComponent(account.client.id)}/smpp-accounts/${encodeURIComponent(account.id)}`,
                );
              }}
            />
          </div>

          {pagination.totalItems > 0 && (
            <div className="mt-4">
              <Pagination
                meta={{
                  page: pagination.page,
                  pageSize:
                    pagination.pageSize,
                  total:
                    pagination.totalItems,
                  totalPages:
                    pagination.totalPages,
                }}
              />
            </div>
          )}
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