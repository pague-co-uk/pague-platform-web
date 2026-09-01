"use client";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

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

import {
  PageContainer,
} from "@/components/layout/page-container";

import { PageHeader } from "@/components/layout/page-header";

import type {
  ClientSummary,
  FindClientsResult,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface ClientsClientProps {
  readonly initialClients:
  | FindClientsResult
  | null;

  readonly canCreateClients: boolean;
}

// ============================================================================
// Clients client
// ============================================================================

export default function ClientsClient({
  initialClients,
  canCreateClients,
}: ClientsClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<ClientSummary>[] =
    [
      {
        key: "displayName",
        header: "Client",
        render: (client) => (
          <div className="min-w-0">
            <Link
              href={`/clients/${encodeURIComponent(
                client.id,
              )}`}
              className="font-medium text-slate-900 transition hover:text-blue-600"
            >
              {client.displayName ||
                client.companyName}
            </Link>

            {client.displayName &&
              client.companyName !==
              client.displayName && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {
                    client.companyName
                  }
                </p>
              )}
          </div>
        ),
      },

      {
        key: "publicId",
        header: "Client ID",
        render: (client) => (
          <code className="font-mono text-xs text-slate-600">
            {
              client.publicId
            }
          </code>
        ),
      },

      {
        key: "email",
        header: "Email",
        render: (client) => (
          <span className="text-sm text-slate-600">
            {client.email}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (client) => (
          <ClientStatusBadge
            status={
              client.status
            }
          />
        ),
      },

      {
        key: "createdAt",
        header: "Created",
        render: (client) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              client.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "",
        className:
          "text-right",
        render: (client) => (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            View
          </Link>
        ),
      },
    ];

  // ==========================================================================
  // Error
  // ==========================================================================

  if (!initialClients) {
    return (
      <PageContainer>
        <PageHeader
          title="Clients"
          description="Manage the clients using the Pague platform."
        />

        <div className="mt-5 rounded-xl border border-slate-200 bg-white">
          <ErrorState
            title="Unable to load clients"
            description="We couldn't load the client list."
          >
            <button
              type="button"
              onClick={() =>
                router.refresh()
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        description="Manage the clients using the Pague platform."
      >
        {canCreateClients && (
          <Link
            href="/clients/new"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Create client
          </Link>
        )}
      </PageHeader>

      {/* ======================================================================
          Filters
      ======================================================================= */}

      <div className="mt-5">
        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search clients..."
          />

          <FilterSelect
            name="status"
            placeholder="All statuses"
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "Suspended",
                value: "SUSPENDED",
              },
              {
                label: "Disabled",
                value: "DISABLED",
              },
            ]}
          />
        </FilterBar>
      </div>

      {/* ======================================================================
          Table
      ======================================================================= */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {initialClients.items.length ===
          0 ? (
          <EmptyState
            title="No clients found"
            description="There are no clients matching the current filters."
          >
            {canCreateClients && (
              <Link
                href="/clients/new"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white"
              >
                Create client
              </Link>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              initialClients.items
            }
            getRowKey={(client) =>
              client.id
            }
            onRowClick={(
              client,
            ) =>
              router.push(
                `/clients/${encodeURIComponent(
                  client.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* ======================================================================
          Pagination
      ======================================================================= */}

      {initialClients.meta.total >
        0 && (
          <div className="mt-4">
            <Pagination
              meta={
                initialClients.meta
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

function ClientStatusBadge({
  status,
}: {
  readonly status:
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";
}) {
  switch (status) {
    case "ACTIVE":
      return (
        <StatusBadge tone="success">
          Active
        </StatusBadge>
      );

    case "SUSPENDED":
      return (
        <StatusBadge tone="warning">
          Suspended
        </StatusBadge>
      );

    case "DISABLED":
      return (
        <StatusBadge tone="danger">
          Disabled
        </StatusBadge>
      );
  }
}

// ============================================================================
// Date
// ============================================================================

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}