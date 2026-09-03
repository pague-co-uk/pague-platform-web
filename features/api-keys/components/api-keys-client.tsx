"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";
import {
  FilterBar,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

import {
  revokeApiKey,
  type ApiKey,
  type ApiKeyPagination,
} from "../api/api-keys-api";

interface ClientOption {
  id: string;
  publicId: string;
  companyName: string;
  displayName: string;
}

interface ApiKeysClientProps {
  clients: ClientOption[];
  apiKeys: ApiKey[];
  pagination: ApiKeyPagination | null;
  canCreateApiKeys: boolean;
  canRevokeApiKeys: boolean;
}

export function ApiKeysClient({
  clients,
  apiKeys,
  pagination,
  canCreateApiKeys,
  canRevokeApiKeys,
}: ApiKeysClientProps) {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [
    revokingApiKeyId,
    setRevokingApiKeyId,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const clientId =
    searchParams.get("clientId") ?? "";

  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (client) =>
            client.id === clientId,
        ),
      [clients, clientId],
    );

  const handleRevoke = async (
    apiKey: ApiKey,
  ) => {
    if (!clientId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Revoke the API key "${apiKey.name}"? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setError(null);
    setRevokingApiKeyId(
      apiKey.id,
    );

    try {
      await revokeApiKey(
        clientId,
        apiKey.id,
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to revoke API key.",
      );
    } finally {
      setRevokingApiKeyId(null);
    }
  };

  const columns =
    useMemo<
      DataTableColumn<ApiKey>[]
    >(
      () => [
        {
          key: "name",
          header: "Name",
          render: (apiKey) => (
            <div>
              <div className="font-medium">
                {apiKey.name}
              </div>

              <div className="text-xs text-muted-foreground">
                {apiKey.publicId}
              </div>
            </div>
          ),
        },

        {
          key: "key",
          header: "Key",
          render: (apiKey) => (
            <code className="text-sm">
              pk_live_
              {apiKey.prefix}
              .••••••••
            </code>
          ),
        },

        {
          key: "status",
          header: "Status",
          render: (apiKey) => {
            if (
              apiKey.status ===
              "ACTIVE"
            ) {
              return (
                <StatusBadge
                  tone="success"
                  dot
                >
                  Active
                </StatusBadge>
              );
            }

            if (
              apiKey.status ===
              "EXPIRED"
            ) {
              return (
                <StatusBadge
                  tone="warning"
                  dot
                >
                  Expired
                </StatusBadge>
              );
            }

            return (
              <StatusBadge
                tone="danger"
                dot
              >
                Revoked
              </StatusBadge>
            );
          },
        },

        {
          key: "lastUsedAt",
          header: "Last used",
          render: (apiKey) =>
            apiKey.lastUsedAt
              ? new Date(
                apiKey.lastUsedAt,
              ).toLocaleString()
              : "Never",
        },

        {
          key: "expiresAt",
          header: "Expires",
          render: (apiKey) =>
            apiKey.expiresAt
              ? new Date(
                apiKey.expiresAt,
              ).toLocaleDateString()
              : "Never",
        },

        {
          key: "actions",
          header: "",
          className: "text-right",
          render: (apiKey) =>
            canRevokeApiKeys &&
              apiKey.status ===
              "ACTIVE" ? (
              <button
                type="button"
                disabled={
                  revokingApiKeyId ===
                  apiKey.id
                }
                onClick={() =>
                  void handleRevoke(
                    apiKey,
                  )
                }
                className="text-sm font-medium text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {revokingApiKeyId ===
                  apiKey.id
                  ? "Revoking..."
                  : "Revoke"}
              </button>
            ) : null,
        },
      ],
      [
        canRevokeApiKeys,
        revokingApiKeyId,
      ],
    );

  const paginationMeta =
    pagination
      ? {
        page: pagination.page,
        pageSize:
          pagination.pageSize,
        total:
          pagination.totalItems,
        totalPages:
          pagination.totalPages,
      }
      : null;

  return (
    <PageContainer>
      <PageHeader
        title="API Keys"
        description="Manage API keys used by clients to access Pague services."
      >
        {clientId &&
          canCreateApiKeys ? (
          <Link
            href={`/api-keys/create?clientId=${encodeURIComponent(
              clientId,
            )}`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create API Key
          </Link>
        ) : null}
      </PageHeader>

      <div className="space-y-4">
        <FilterBar
          resetParams={["page"]}
        >
          <FilterSelect
            name="clientId"
            options={[
              {
                value: "",
                label: "Select client",
              },
              ...clients.map(
                (client) => ({
                  value: client.id,
                  label:
                    client.displayName ||
                    client.companyName,
                }),
              ),
            ]}
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
                value: "REVOKED",
                label: "Revoked",
              },
              {
                value: "EXPIRED",
                label: "Expired",
              },
            ]}
          />
        </FilterBar>

        {selectedClient ? (
          <div className="text-sm text-muted-foreground color-slate-500 dark:text-slate-400">
            Showing API keys for{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-400">
              {selectedClient.displayName ||
                selectedClient.companyName}
            </span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!clientId ? (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center">
            <h2 className="text-sm font-semibold">
              Select a client
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select a client above to view
              and manage its API keys.
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={apiKeys}
              getRowKey={(apiKey) =>
                apiKey.id
              }
            />

            {paginationMeta &&
              paginationMeta.totalPages >
              1 ? (
              <Pagination
                meta={paginationMeta}
              />
            ) : null}
          </>
        )}
      </div>
    </PageContainer>
  );
}