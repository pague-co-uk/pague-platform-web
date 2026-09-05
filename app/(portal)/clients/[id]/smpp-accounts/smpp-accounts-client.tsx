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
  StatusBadge,
} from "@/components/ui/status-badge";

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
            href={`/clients/${client.id}/smpp-accounts/${account.id}`}
            className="font-medium text-slate-900 hover:text-slate-600"
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
            href={`/clients/${client.id}/smpp-accounts/${account.id}`}
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
        description={`SMPP accounts for ${clientName}.`}
      >
        {canCreateSmppAccounts && (
          <Link
            href={`/clients/${client.id}/smpp-accounts/create`}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create SMPP Account
          </Link>
        )}
      </PageHeader>

      {smppAccounts.length === 0 ? (
        <EmptyState
          title="No SMPP accounts"
          description="This client does not have any SMPP accounts yet."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={smppAccounts}
          getRowKey={(account) =>
            account.id
          }
          onRowClick={(account) => {
            window.location.href =
              `/clients/${client.id}/smpp-accounts/${account.id}`;
          }}
        />
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