"use client";

import Link from "next/link";

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
  Pagination,
} from "@/components/ui/pagination";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Props
// ============================================================================

interface PlatformFloatClientProps {
  readonly clients: readonly ClientSummary[];

  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformFloatClient({
  clients,
  pagination,
}: PlatformFloatClientProps) {
  const columns:
    DataTableColumn<ClientSummary>[] =
    [
      {
        key: "publicId",

        header: "Client",

        render: (client) => {
          const clientName =
            client.displayName ||
            client.companyName;

          return (
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900">
                {clientName}
              </div>

              <div className="font-mono text-xs text-slate-500">
                {client.publicId}
              </div>
            </div>
          );
        },
      },

      {
        key: "companyName",

        header: "Company",

        render: (client) => (
          <span className="text-sm text-slate-600">
            {client.companyName ||
              "—"}
          </span>
        ),
      },

      {
        key: "status",

        header: "Status",

        render: (client) => (
          <span className="text-sm text-slate-600">
            {client.status}
          </span>
        ),
      },

      {
        key: "actions",

        header: "",

        className:
          "w-[1%] whitespace-nowrap text-right",

        render: (client) => (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/float`}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            Manage Float
          </Link>
        ),
      },
    ];

  return (
    <PageContainer>
      <PageHeader
        title="Float Accounts"
        description="Manage SMS credit balances and transactions for individual clients."
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No float accounts"
          description="There are no clients available to manage float."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={clients}
            getRowKey={(client) =>
              client.id
            }
            onRowClick={(client) => {
              window.location.href =
                `/clients/${encodeURIComponent(
                  client.id,
                )}/float`;
            }}
          />

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
        </>
      )}
    </PageContainer>
  );
}