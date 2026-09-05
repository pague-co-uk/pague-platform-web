"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

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
  useToast,
} from "@/components/ui/toast";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  activateClient,
  deleteClient,
  disableClient,
  suspendClient,
  type Client,
} from "@/features/clients/api/clients-api";

import type {
  ApiKey,
  ApiKeyPagination,
} from "@/features/api-keys/api/api-keys-api";

import type {
  Webhook,
  WebhookPagination,
} from "@/features/webhooks/api/webhooks-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface ClientDetailsClientProps {
  readonly client: Client;

  readonly canUpdateClient: boolean;

  readonly canActivateClient: boolean;

  readonly canSuspendClient: boolean;

  readonly canDisableClient: boolean;

  readonly canDeleteClient: boolean;

  readonly apiKeys: ApiKey[];

  readonly apiKeysPagination: ApiKeyPagination | null;

  readonly webhooks: Webhook[];

  readonly webhooksPagination: WebhookPagination | null;

  readonly canReadApiKeys: boolean;

  readonly canCreateApiKeys: boolean;

  readonly canRevokeApiKeys: boolean;

  readonly canReadWebhooks: boolean;

  readonly canCreateWebhooks: boolean;

  readonly canUpdateWebhooks: boolean;

  readonly canDeleteWebhooks: boolean;

  readonly canRotateWebhookSecrets: boolean;

  readonly canReadWebhookDeliveries: boolean;
}

// ============================================================================
// Client details
// ============================================================================

export default function ClientDetailsClient({
  client: initialClient,
  canUpdateClient,
  canActivateClient,
  canSuspendClient,
  canDisableClient,
  canDeleteClient,
  apiKeys,
  apiKeysPagination,
  webhooks,
  webhooksPagination,
  canReadApiKeys,
  canCreateApiKeys,
  canRevokeApiKeys,
  canReadWebhooks,
  canCreateWebhooks,
  canUpdateWebhooks,
  canDeleteWebhooks,
  canRotateWebhookSecrets,
  canReadWebhookDeliveries,
}: ClientDetailsClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    client,
    setClient,
  ] = useState<Client>(
    initialClient,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ==========================================================================
  // Lifecycle action
  // ==========================================================================

  async function performStatusAction(
    action:
      | "activate"
      | "suspend"
      | "disable",
  ) {
    if (actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      let updatedClient: Client;

      switch (action) {
        case "activate":
          updatedClient =
            await activateClient(
              client.id,
            );
          break;

        case "suspend":
          updatedClient =
            await suspendClient(
              client.id,
            );
          break;

        case "disable":
          updatedClient =
            await disableClient(
              client.id,
            );
          break;
      }

      setClient(
        updatedClient,
      );

      success(
        getActionSuccessTitle(
          action,
        ),
        getActionSuccessDescription(
          action,
          client.displayName ||
          client.companyName,
        ),
      );
    } catch (error) {
      console.error(
        `[Clients] Unable to ${action} client.`,
        error,
      );

      showError(
        getActionErrorTitle(
          action,
        ),
        error instanceof Error
          ? error.message
          : `Unable to ${action} client.`,
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  // ==========================================================================
  // Delete
  // ==========================================================================

  async function handleDelete() {
    if (
      deleting ||
      actionLoading ||
      !client
    ) {
      return;
    }

    setDeleting(true);

    try {
      await deleteClient(
        client.id,
      );

      success(
        "Client deleted",
        `${client.displayName || client.companyName} has been deleted successfully.`,
      );

      setShowDeleteModal(false);

      router.push("/clients");
      router.refresh();
    } catch (error) {
      console.error(
        "[Clients] Unable to delete client.",
        error,
      );

      showError(
        "Unable to delete client",
        error instanceof Error
          ? error.message
          : "Unable to delete client.",
      );
    } finally {
      setDeleting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="Client details"
        description="View and manage this client's account."
      >
        {canUpdateClient && (
          <Link
            href={`/clients/${encodeURIComponent(
              client.id,
            )}/edit`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Edit client
          </Link>
        )}
      </PageHeader>

      {/* ======================================================================
          Back
      ======================================================================= */}

      <div className="mb-5">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeftIcon />

          Back to clients
        </Link>
      </div>

      {/* ======================================================================
          Identity
      ======================================================================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-semibold text-blue-700">
              {getInitials(
                client.displayName ||
                client.companyName,
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold text-slate-900">
                  {client.displayName ||
                    client.companyName}
                </h2>

                <ClientStatusBadge
                  status={
                    client.status
                  }
                />
              </div>

              {client.displayName &&
                client.companyName !==
                client.displayName && (
                  <p className="mt-1 text-sm text-slate-500">
                    {
                      client.companyName
                    }
                  </p>
                )}

              <p className="mt-1 font-mono text-xs text-slate-400">
                {
                  client.publicId
                }
              </p>
            </div>
          </div>

          {/* ==================================================================
              Lifecycle actions
          =================================================================== */}

          <div className="flex flex-wrap items-center gap-2">
            {client.status ===
              "ACTIVE" &&
              canSuspendClient && (
                <button
                  type="button"
                  onClick={() =>
                    performStatusAction(
                      "suspend",
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 px-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Working…"
                    : "Suspend"}
                </button>
              )}

            {client.status ===
              "SUSPENDED" &&
              canActivateClient && (
                <button
                  type="button"
                  onClick={() =>
                    performStatusAction(
                      "activate",
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Working…"
                    : "Activate"}
                </button>
              )}

            {client.status ===
              "DISABLED" &&
              canActivateClient && (
                <button
                  type="button"
                  onClick={() =>
                    performStatusAction(
                      "activate",
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Working…"
                    : "Activate"}
                </button>
              )}

            {client.status !==
              "DISABLED" &&
              canDisableClient && (
                <button
                  type="button"
                  onClick={() =>
                    performStatusAction(
                      "disable",
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Working…"
                    : "Disable"}
                </button>
              )}

            {canDeleteClient && (
              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(
                    true,
                  )
                }
                disabled={
                  deleting ||
                  actionLoading
                }
                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete client
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          Main grid
      ======================================================================= */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* ====================================================================
            Client information
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white xl:col-span-2">
          <SectionHeader
            title="Client information"
            description="Business and contact information associated with this client."
          />

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <InfoItem
              label="Company name"
              value={
                client.companyName
              }
            />

            <InfoItem
              label="Display name"
              value={
                client.displayName
              }
            />

            <InfoItem
              label="Email"
              value={
                client.email
              }
            />

            <InfoItem
              label="Phone"
              value={
                client.phone ??
                "Not provided"
              }
            />

            <InfoItem
              label="Client ID"
              value={
                client.publicId
              }
              mono
            />

            <InfoItem
              label="Internal ID"
              value={
                client.id
              }
              mono
            />
          </div>
        </section>

        {/* ====================================================================
            Configuration
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white">
          <SectionHeader
            title="Configuration"
            description="Client platform configuration."
          />

          <div className="space-y-4 p-5">
            <StatusRow
              label="Status"
              value={getStatusLabel(
                client.status,
              )}
              tone={getStatusTone(
                client.status,
              )}
            />

            <StatusRow
              label="Rate limit"
              value={`${client.rateLimitPerSecond} / second`}
              tone="neutral"
            />

            <StatusRow
              label="Timezone"
              value={
                client.timezone
              }
              tone="neutral"
            />
          </div>
        </section>

        {/* ====================================================================
            API Keys
        ===================================================================== */}

        {canReadApiKeys && (
          <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
            <SectionHeader
              title="API Keys"
              description="Credentials used by this client to access the platform API."
              trailing={
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/api-keys`}
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    Manage
                  </Link>

                  {canCreateApiKeys && (
                    <Link
                      href={`/clients/${encodeURIComponent(
                        client.id,
                      )}/api-keys/new`}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      Create key
                    </Link>
                  )}
                </div>
              }
            />

            {apiKeys.length ===
              0 ? (
              <div className="px-5 py-8 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-700">
                  No API keys
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This client does not have any API keys yet.
                </p>

                {canCreateApiKeys && (
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/api-keys/create`}
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Create API key
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {apiKeys.map(
                  (apiKey) => (
                    <div
                      key={
                        apiKey.id
                      }
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {
                            apiKey.name
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-xs text-slate-500">
                            {
                              apiKey.prefix
                            }
                            ••••••••
                          </span>

                          {apiKey.expiresAt && (
                            <span className="text-xs text-slate-400">
                              Expires{" "}
                              {formatDate(
                                apiKey.expiresAt,
                              )}
                            </span>
                          )}

                          {apiKey.lastUsedAt && (
                            <span className="text-xs text-slate-400">
                              Last used{" "}
                              {formatDate(
                                apiKey.lastUsedAt,
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <StatusBadge
                        tone={getApiKeyStatusTone(
                          apiKey.status,
                        )}
                        dot
                      >
                        {getApiKeyStatusLabel(
                          apiKey.status,
                        )}
                      </StatusBadge>
                    </div>
                  ),
                )}
              </div>
            )}

            {apiKeysPagination &&
              apiKeysPagination.totalItems >
              apiKeys.length && (
                <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/api-keys`}
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    View all{" "}
                    {
                      apiKeysPagination.totalItems
                    }{" "}
                    API keys →
                  </Link>
                </div>
              )}
          </section>
        )}

        {/* ====================================================================
            Webhooks
        ===================================================================== */}

        {canReadWebhooks && (
          <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
            <SectionHeader
              title="Webhooks"
              description="HTTP endpoints used to notify this client about platform events."
              trailing={
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/webhooks`}
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    Manage
                  </Link>

                  {canCreateWebhooks && (
                    <Link
                      href={`/clients/${encodeURIComponent(
                        client.id,
                      )}/webhooks/create`}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      Add webhook
                    </Link>
                  )}
                </div>
              }
            />

            {webhooks.length ===
              0 ? (
              <div className="px-5 py-8 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-700">
                  No webhooks
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This client does not have any webhook endpoints yet.
                </p>

                {canCreateWebhooks && (
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/webhooks/create`}
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Add webhook
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {webhooks.map(
                  (webhook) => (
                    <div
                      key={
                        webhook.id
                      }
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {
                            webhook.name
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {
                            webhook.url
                          }
                        </p>
                      </div>

                      <StatusBadge
                        tone={
                          webhook.enabled
                            ? "success"
                            : "neutral"
                        }
                        dot
                      >
                        {webhook.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </StatusBadge>
                    </div>
                  ),
                )}
              </div>
            )}

            {webhooksPagination &&
              webhooksPagination.totalItems >
              webhooks.length && (
                <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/webhooks`}
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    View all{" "}
                    {
                      webhooksPagination.totalItems
                    }{" "}
                    webhooks →
                  </Link>
                </div>
              )}
          </section>
        )}

        {/* ====================================================================
            Timestamps
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
          <SectionHeader
            title="Account history"
            description="Client record timestamps."
          />

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <InfoItem
              label="Created"
              value={formatDate(
                client.createdAt,
              )}
            />

            <InfoItem
              label="Last updated"
              value={formatDate(
                client.updatedAt,
              )}
            />
          </div>
        </section>
      </div>

      {/* ======================================================================
          Delete confirmation
      ======================================================================= */}

      <ConfirmModal
        open={
          showDeleteModal
        }
        title="Delete client?"
        description={`This will permanently delete ${client.displayName ||
          client.companyName
          }. This action cannot be undone.`}
        confirmLabel={
          deleting
            ? "Deleting…"
            : "Delete client"
        }
        cancelLabel="Cancel"
        destructive
        onConfirm={
          handleDelete
        }
        onCancel={() => {
          if (!deleting) {
            setShowDeleteModal(
              false,
            );
          }
        }}
      />
    </PageContainer>
  );
}

// ============================================================================
// Section header
// ============================================================================

interface SectionHeaderProps {
  title: string;
  description?: string;
  trailing?: React.ReactNode;
}

function SectionHeader({
  title,
  description,
  trailing,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {trailing}
    </div>
  );
}

// ============================================================================
// Info item
// ============================================================================

interface InfoItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

function InfoItem({
  label,
  value,
  mono = false,
}: InfoItemProps) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1.5 break-all text-sm text-slate-800",
          mono
            ? "font-mono text-xs"
            : "font-medium",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Status row
// ============================================================================

interface StatusRowProps {
  label: string;
  value: string;
  tone:
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";
}

function StatusRow({
  label,
  value,
  tone,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <StatusBadge tone={tone}>
        {value}
      </StatusBadge>
    </div>
  );
}

// ============================================================================
// Client status badge
// ============================================================================

function ClientStatusBadge({
  status,
}: {
  readonly status:
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";
}) {
  return (
    <StatusBadge
      tone={getStatusTone(
        status,
      )}
    >
      {getStatusLabel(
        status,
      )}
    </StatusBadge>
  );
}

function getStatusLabel(
  status:
    | "ACTIVE"
    | "SUSPENDED"
    | "DISABLED",
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "SUSPENDED":
      return "Suspended";

    case "DISABLED":
      return "Disabled";
  }
}

function getStatusTone(
  status:
    | "ACTIVE"
    | "SUSPENDED"
    | "DISABLED",
):
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "SUSPENDED":
      return "warning";

    case "DISABLED":
      return "danger";
  }
}

// ============================================================================
// API key helpers
// ============================================================================

function getApiKeyStatusLabel(
  status:
    | "ACTIVE"
    | "EXPIRED"
    | "REVOKED",
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "EXPIRED":
      return "Expired";

    case "REVOKED":
      return "Revoked";
  }
}

function getApiKeyStatusTone(
  status:
    | "ACTIVE"
    | "EXPIRED"
    | "REVOKED",
):
  | "success"
  | "warning"
  | "danger" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "EXPIRED":
      return "warning";

    case "REVOKED":
      return "danger";
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getInitials(
  value: string,
): string {
  const parts =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "C";
  }

  return parts
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase(),
    )
    .join("");
}

// ============================================================================
// Action messages
// ============================================================================

function getActionSuccessTitle(
  action:
    | "activate"
    | "suspend"
    | "disable",
): string {
  switch (action) {
    case "activate":
      return "Client activated";

    case "suspend":
      return "Client suspended";

    case "disable":
      return "Client disabled";
  }
}

function getActionSuccessDescription(
  action:
    | "activate"
    | "suspend"
    | "disable",
  name: string,
): string {
  switch (action) {
    case "activate":
      return `${name} has been activated successfully.`;

    case "suspend":
      return `${name} has been suspended successfully.`;

    case "disable":
      return `${name} has been disabled successfully.`;
  }
}

function getActionErrorTitle(
  action:
    | "activate"
    | "suspend"
    | "disable",
): string {
  switch (action) {
    case "activate":
      return "Unable to activate client";

    case "suspend":
      return "Unable to suspend client";

    case "disable":
      return "Unable to disable client";
  }
}

// ============================================================================
// Chevron
// ============================================================================

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}