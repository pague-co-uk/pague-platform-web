"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  useToast,
} from "@/components/ui/toast";

import {
  revokeApiKey,
  type ApiKey,
  type ApiKeyPagination,
} from "@/features/api-keys/api/api-keys-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import {
  formatDate,
} from "@/lib/date/format-date";

interface ApiKeysClientProps {
  readonly client: Client;

  readonly apiKeys: ApiKey[];

  readonly pagination: ApiKeyPagination;

  readonly canCreateApiKeys: boolean;

  readonly canRevokeApiKeys: boolean;
}

export default function ApiKeysClient({
  client,
  apiKeys,
  pagination,
  canCreateApiKeys,
  canRevokeApiKeys,
}: ApiKeysClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    selectedApiKey,
    setSelectedApiKey,
  ] = useState<ApiKey | null>(null);

  const [
    revoking,
    setRevoking,
  ] = useState(false);

  const clientName =
    client.displayName ||
    client.companyName;

  async function handleRevoke() {
    if (
      !selectedApiKey ||
      revoking
    ) {
      return;
    }

    setRevoking(true);

    try {
      await revokeApiKey(
        client.id,
        selectedApiKey.id,
      );

      success(
        "API key revoked",
        `${selectedApiKey.name} has been revoked successfully.`,
      );

      setSelectedApiKey(null);

      router.refresh();
    } catch (error) {
      console.error(
        "[API Keys] Unable to revoke API key.",
        error,
      );

      showError(
        "Unable to revoke API key",
        error instanceof Error
          ? error.message
          : "Unable to revoke API key.",
      );
    } finally {
      setRevoking(false);
    }
  }

  const columns: DataTableColumn<ApiKey>[] = [
    {
      key: "name",
      header: "Name",
      render: (apiKey) => (
        <div className="min-w-0">
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/api-keys/${encodeURIComponent(
              apiKey.id,
            )}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="font-medium text-slate-900 transition hover:text-slate-600"
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
          status={apiKey.status}
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
      className: "text-right",
      render: (apiKey) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/api-keys/${encodeURIComponent(
              apiKey.id,
            )}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            View
          </Link>

          {apiKey.status === "ACTIVE" &&
            canRevokeApiKeys && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setSelectedApiKey(
                    apiKey,
                  );
                }}
                className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
              >
                Revoke
              </button>
            )}
        </div>
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
          title="API Keys"
          description={`Manage API credentials for ${clientName}.`}
        />

        {canCreateApiKeys && (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/api-keys/new`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Create API key
          </Link>
        )}
      </div>

      {/* Client context */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
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

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          resetParams={[
            "status",
            "page",
          ]}
        >
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
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {apiKeys.length === 0 ? (
          <EmptyState
            title="No API keys found"
            description="There are no API keys matching the current filters."
          >
            {canCreateApiKeys && (
              <Link
                href={`/clients/${encodeURIComponent(
                  client.id,
                )}/api-keys/create`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Create API key
              </Link>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={columns}
            rows={apiKeys}
            getRowKey={(apiKey) =>
              apiKey.id
            }
            onRowClick={(apiKey) =>
              router.push(
                `/clients/${encodeURIComponent(
                  client.id,
                )}/api-keys/${encodeURIComponent(
                  apiKey.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.totalItems > 0 && (
        <div className="mt-5">
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

      {/* Revoke confirmation */}
      <ConfirmModal
        open={
          selectedApiKey !== null
        }
        title="Revoke API key?"
        description={
          selectedApiKey
            ? `This will permanently revoke "${selectedApiKey.name}". Any application using this key will no longer be able to authenticate with it.`
            : ""
        }
        confirmLabel={
          revoking
            ? "Revoking…"
            : "Revoke API key"
        }
        cancelLabel="Cancel"
        destructive
        onConfirm={handleRevoke}
        onCancel={() => {
          if (!revoking) {
            setSelectedApiKey(null);
          }
        }}
      />
    </PageContainer>
  );
}

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