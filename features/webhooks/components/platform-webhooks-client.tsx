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
  ClientActionSelector,
} from "@/components/ui/client-action-selector";

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

import type {
  Webhook,
  WebhookPagination,
} from "../api/webhooks-api";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface PlatformWebhooksClientProps {
  readonly webhooks: Webhook[];

  readonly pagination: WebhookPagination | null;

  readonly canCreateWebhooks: boolean;

  readonly clients: readonly ClientSummary[];
}

// ============================================================================
// Helpers
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
      timeZone: "UTC",
    },
  ).format(new Date(value));
}

// ============================================================================
// Component
// ============================================================================

export function PlatformWebhooksClient({
  webhooks,
  pagination,
  canCreateWebhooks,
  clients,
}: PlatformWebhooksClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<Webhook>[] =
    [
      {
        key: "name",
        header: "Name",
        render: (webhook) => (
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900">
              {webhook.name}
            </div>

            <div className="truncate text-xs text-slate-500">
              {webhook.publicId}
            </div>
          </div>
        ),
      },

      {
        key: "client",
        header: "Client",
        render: (webhook) => {
          if (!webhook.client) {
            return (
              <span className="text-sm text-slate-400">
                Unknown client
              </span>
            );
          }

          return (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">
                {webhook.client.displayName ||
                  webhook.client.companyName}
              </div>

              <div className="truncate font-mono text-xs text-slate-400">
                {webhook.client.publicId}
              </div>
            </div>
          );
        },
      },

      {
        key: "url",
        header: "Endpoint",
        render: (webhook) => (
          <span
            className="block max-w-md truncate text-sm text-slate-600"
            title={webhook.url}
          >
            {webhook.url}
          </span>
        ),
      },

      {
        key: "enabled",
        header: "Status",
        render: (webhook) =>
          webhook.enabled ? (
            <StatusBadge
              tone="success"
              dot
            >
              Enabled
            </StatusBadge>
          ) : (
            <StatusBadge
              tone="neutral"
              dot
            >
              Disabled
            </StatusBadge>
          ),
      },

      {
        key: "updatedAt",
        header: "Updated",
        render: (webhook) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatDate(
              webhook.updatedAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (webhook) => {
          if (!webhook.client) {
            return null;
          }

          return (
            <Link
              href={`/clients/${encodeURIComponent(
                webhook.client.id,
              )}/webhooks/${encodeURIComponent(
                webhook.id,
              )}`}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              View
            </Link>
          );
        },
      },
    ];

  // ==========================================================================
  // Row click
  // ==========================================================================

  function handleRowClick(
    webhook: Webhook,
  ) {
    if (!webhook.client) {
      return;
    }

    router.push(
      `/clients/${encodeURIComponent(
        webhook.client.id,
      )}/webhooks/${encodeURIComponent(
        webhook.id,
      )}`,
    );
  }

  // ==========================================================================
  // Pagination
  // ==========================================================================

  const paginationMeta =
    pagination
      ? {
        page:
          pagination.page,
        pageSize:
          pagination.pageSize,
        total:
          pagination.totalItems,
        totalPages:
          pagination.totalPages,
      }
      : {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="space-y-6 px-6 pb-6 pt-6">
      {/* ====================================================================
          Header
      ===================================================================== */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Webhooks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View webhook endpoints configured across all clients.
          </p>
        </div>

        {canCreateWebhooks && (
          <ClientActionSelector
            clients={clients}
            actions={[
              {
                label: "Create Webhook",
                href: (
                  clientId,
                ) =>
                  `/clients/${encodeURIComponent(
                    clientId,
                  )}/webhooks/create`,
                variant:
                  "primary",
              },
            ]}
          />
        )}
      </div>

      {/* ====================================================================
          Filters
      ===================================================================== */}

      <FilterBar
        resetParams={[
          "page",
        ]}
      >
        <FilterSelect
          name="enabled"
          placeholder="All statuses"
          options={[
            {
              value: "true",
              label: "Enabled",
            },
            {
              value: "false",
              label: "Disabled",
            },
          ]}
        />
      </FilterBar>

      {/* ====================================================================
          Table
      ===================================================================== */}

      <DataTable
        columns={columns}
        rows={webhooks}
        getRowKey={(webhook) =>
          webhook.id
        }
        onRowClick={
          handleRowClick
        }
      />

      {/* ====================================================================
          Pagination
      ===================================================================== */}

      {pagination &&
        pagination.totalPages > 1 && (
          <Pagination
            meta={
              paginationMeta
            }
          />
        )}
    </div>
  );
}