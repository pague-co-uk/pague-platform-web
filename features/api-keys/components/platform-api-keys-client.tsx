"use client";


import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

import {
  FilterBar,
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
  type ApiKey,
  type ApiKeyPagination
} from "@/features/api-keys/api/api-keys-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface PlatformApiKeysClientProps {
  readonly apiKeys: ApiKey[];

  readonly pagination: ApiKeyPagination;
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformApiKeysClient({
  apiKeys,
  pagination,
}: PlatformApiKeysClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<ApiKey>[] =
    [
      {
        key: "name",
        header: "Name",
        render: (apiKey) => (
          <div className="min-w-0">
            <Link
              href={`/clients/${encodeURIComponent(
                apiKey.clientId,
              )}/api-keys/${encodeURIComponent(
                apiKey.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="font-medium text-slate-900 transition hover:text-blue-600"
            >
              {apiKey.name}
            </Link>

            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
              {apiKey.publicId}
            </p>
          </div>
        ),
      },

      {
        key: "client",
        header: "Client",
        render: (apiKey) => {
          const clientName =
            apiKey.client?.displayName ||
            apiKey.client?.companyName ||
            "Unknown client";

          return (
            <div className="min-w-0">
              <Link
                href={`/clients/${encodeURIComponent(
                  apiKey.clientId,
                )}`}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="truncate text-sm font-medium text-slate-700 transition hover:text-blue-600"
              >
                {clientName}
              </Link>

              {apiKey.client?.publicId && (
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                  {apiKey.client.publicId}
                </p>
              )}
            </div>
          );
        },
      },

      {
        key: "key",
        header: "Key",
        render: (apiKey) => (
          <code className="font-mono text-xs text-slate-600">
            {apiKey.prefix}
            ••••••••
          </code>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (apiKey) => (
          <ApiKeyStatusBadge
            status={
              apiKey.status
            }
          />
        ),
      },

      {
        key: "lastUsedAt",
        header: "Last used",
        render: (apiKey) => (
          <span className="text-sm text-slate-500">
            {apiKey.lastUsedAt
              ? formatDate(
                apiKey.lastUsedAt,
              )
              : "Never"}
          </span>
        ),
      },

      {
        key: "expiresAt",
        header: "Expires",
        render: (apiKey) => (
          <span className="text-sm text-slate-500">
            {apiKey.expiresAt
              ? formatDate(
                apiKey.expiresAt,
              )
              : "Never"}
          </span>
        ),
      },

      {
        key: "createdAt",
        header: "Created",
        render: (apiKey) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              apiKey.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "",
        className:
          "text-right",
        render: (apiKey) => (
          <div className="flex items-center justify-end">
            <Link
              href={`/clients/${encodeURIComponent(
                apiKey.clientId,
              )}/api-keys/${encodeURIComponent(
                apiKey.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              View
            </Link>
          </div>
        ),
      },
    ];

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="API Keys"
        description="Manage API credentials across all clients."
      />

      {/* ======================================================================
          Filters
      ======================================================================= */}

      <FilterBar
        resetParams={[
          "clientId",
          "status",
          "search",
          "page",
        ]}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <input
            type="search"
            name="search"
            placeholder="Search API keys..."
            defaultValue=""
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <input
          type="text"
          name="clientId"
          placeholder="Client ID"
          defaultValue=""
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:w-48"
        />

        <FilterSelect
          name="status"
          options={[
            {
              value: "",
              label: "All API keys",
            },
            {
              value: "ACTIVE",
              label: "Active",
            },
            {
              value: "EXPIRED",
              label: "Expired",
            },
            {
              value: "REVOKED",
              label: "Revoked",
            },
          ]}
        />
      </FilterBar>

      {/* ======================================================================
          Table
      ======================================================================= */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {apiKeys.length ===
          0 ? (
          <EmptyState
            title="No API keys found"
            description="There are no API keys matching the current filters."
          />
        ) : (
          <DataTable<ApiKey>
            columns={
              columns
            }
            rows={
              apiKeys
            }
            getRowKey={(apiKey) =>
              apiKey.id
            }
            onRowClick={(
              apiKey,
            ) =>
              router.push(
                `/clients/${encodeURIComponent(
                  apiKey.clientId,
                )}/api-keys/${encodeURIComponent(
                  apiKey.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* ======================================================================
          Pagination
      ======================================================================= */}

      {pagination.totalItems >
        0 && (
          <div className="mt-4">
            <Pagination
              meta={{
                page:
                  pagination.page,
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
    </PageContainer>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function ApiKeyStatusBadge({
  status,
}: {
  readonly status:
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";
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

    case "EXPIRED":
      return (
        <StatusBadge
          tone="warning"
          dot
        >
          Expired
        </StatusBadge>
      );

    case "REVOKED":
      return (
        <StatusBadge
          tone="danger"
          dot
        >
          Revoked
        </StatusBadge>
      );
  }
}