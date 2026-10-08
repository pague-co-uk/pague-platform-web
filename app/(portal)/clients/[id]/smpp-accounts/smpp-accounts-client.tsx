"use client";

import Link from "next/link";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import type {
  SmppAccount,
} from "@/features/smpp-accounts/api/smpp-accounts-api";

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
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

// ============================================================================
// Props
// ============================================================================

interface SmppAccountsClientProps {
  readonly client: Client;

  readonly smppAccounts: readonly SmppAccount[];

  readonly canCreateSmppAccounts: boolean;

  readonly canUpdateSmppAccounts: boolean;

  readonly canChangeSmppPasswords: boolean;

  readonly canActivateSmppAccounts: boolean;

  readonly canDisableSmppAccounts: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function SmppAccountsClient({
  client,
  smppAccounts,
  canCreateSmppAccounts,
  canUpdateSmppAccounts,
}: SmppAccountsClientProps) {
  const clientName =
    client.displayName ||
    client.companyName;

  const columns: DataTableColumn<SmppAccount>[] =
    [
      {
        key: "systemId",

        header: "System ID",

        render: (account) => (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/smpp-accounts/${encodeURIComponent(
              account.id,
            )}`}
            className="font-medium text-slate-900 transition hover:text-slate-600"
          >
            {account.systemId}
          </Link>
        ),
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

        render: (account) => (
          <span className="text-sm text-slate-700">
            {account.maxConcurrentBinds}
          </span>
        ),
      },

      {
        key: "enquireLinkInterval",

        header: "Enquire Link",

        render: (account) => (
          <span className="text-sm text-slate-700">
            {account.enquireLinkInterval}s
          </span>
        ),
      },

      {
        key: "createdAt",

        header: "Created",

        render: (account) => (
          <span className="text-sm text-slate-600">
            {formatDate(
              account.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",

        header: "",

        className:
          "w-[1%] whitespace-nowrap text-right",

        render: (account) => (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/smpp-accounts/${encodeURIComponent(
              account.id,
            )}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            View
          </Link>
        ),
      },
    ];

  return (
    <PageContainer>
      {/* Context navigation */}
      <div className="mb-6">
        <ContextAwareBackLinks
          clientHref={`/clients/${encodeURIComponent(
            client.id,
          )}`}
          clientLabel="Back to client"
          showPlatformLink={false}
        />
      </div>

      {/* Page heading */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <PageHeader
          title="SMPP Accounts"
          description={`SMPP accounts for ${clientName}.`}
        />

        {canCreateSmppAccounts && (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/smpp-accounts/create`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Create SMPP Account
          </Link>
        )}
      </div>

      {/* Client context */}
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Client
        </span>

        <span className="h-1 w-1 rounded-full bg-slate-300" />

        <Link
          href={`/clients/${encodeURIComponent(
            client.id,
          )}`}
          className="truncate text-sm font-medium text-slate-700 transition hover:text-slate-950"
        >
          {clientName}
        </Link>

        <span className="font-mono text-xs text-slate-400">
          {client.publicId}
        </span>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {smppAccounts.length === 0 ? (
          <EmptyState
            title="No SMPP accounts"
            description="This client does not have any SMPP accounts yet."
          >
            {canCreateSmppAccounts && (
              <Link
                href={`/clients/${encodeURIComponent(
                  client.id,
                )}/smpp-accounts/create`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Create SMPP Account
              </Link>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={columns}
            rows={smppAccounts}
            getRowKey={(account) =>
              account.id
            }
            onRowClick={(account) => {
              window.location.href =
                `/clients/${encodeURIComponent(
                  client.id,
                )}/smpp-accounts/${encodeURIComponent(
                  account.id,
                )}`;
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Status
// ============================================================================

function SmppAccountStatusBadge({
  status,
}: {
  readonly status: SmppAccount["status"];
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