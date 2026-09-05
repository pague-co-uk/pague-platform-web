"use client";

import Link from "next/link";
import {
  useState,
} from "react";

import {
  revokeApiKey,
  type ApiKey,
} from "@/features/api-keys/api/api-keys-api";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useToast,
} from "@/components/ui/toast";

import type {
  Client,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface ApiKeyDetailsClientProps {
  readonly client: Client;

  readonly apiKey: ApiKey;

  readonly canRevoke: boolean;
}

// ============================================================================
// Date
// ============================================================================

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Never";
  }

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
  ).format(
    new Date(value),
  );
}

// ============================================================================
// Component
// ============================================================================

export default function ApiKeyDetailsClient({
  client,
  apiKey: initialApiKey,
  canRevoke,
}: ApiKeyDetailsClientProps) {
  const {
    success,
    error: showError,
  } = useToast();

  const [
    apiKey,
    setApiKey,
  ] = useState(
    initialApiKey,
  );

  const [
    confirmRevoke,
    setConfirmRevoke,
  ] = useState(false);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  // ==========================================================================
  // Revoke
  // ==========================================================================

  async function handleRevoke() {
    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      await revokeApiKey(
        client.id,
        apiKey.id,
      );

      setApiKey(
        (current) => ({
          ...current,
          status: "REVOKED",
          revokedAt:
            new Date().toISOString(),
        }),
      );

      success(
        "API key revoked",
        `${apiKey.name} has been revoked successfully.`,
      );
    } catch (error) {
      console.error(
        "[API Keys] API key revoke failed.",
        error,
      );

      showError(
        "Unable to revoke API key",
        error instanceof Error
          ? error.message
          : "Unable to complete the requested action.",
      );
    } finally {
      setProcessing(false);
      setConfirmRevoke(false);
    }
  }

  const clientName =
    client.displayName ||
    client.companyName;

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pb-6 pt-6">
        {/* ================================================================== */}
        {/* Header */}
        {/* ================================================================== */}

        <div className="relative mx-auto w-full max-w-5xl px-6 pb-6 pt-6">
          <div className="absolute -left-80 top-6">
            <Link
              href={`/clients/${encodeURIComponent(
                client.id,
              )}/api-keys`}
              className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to API Keys
            </Link>
          </div>

          <div className="mb-6">
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {apiKey.name}
                  </h1>

                  <ApiKeyStatusBadge
                    status={
                      apiKey.status
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  API key for{" "}
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}`}
                    className="font-medium text-slate-700 transition hover:text-blue-600"
                  >
                    {clientName}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* Details */}
        {/* ================================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              API key details
            </h2>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            {/* ============================================================ */}
            {/* Name */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Name
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {apiKey.name}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Public ID */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Public ID
              </div>

              <div className="mt-1 break-all font-mono text-sm text-slate-900">
                {apiKey.publicId}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Prefix */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Key prefix
              </div>

              <div className="mt-1 font-mono text-sm text-slate-900">
                {apiKey.prefix}
                ••••••••
              </div>
            </div>

            {/* ============================================================ */}
            {/* Client */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Client
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {clientName}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Status */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </div>

              <div className="mt-2">
                <ApiKeyStatusBadge
                  status={
                    apiKey.status
                  }
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* Last used */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Last used
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {formatDate(
                  apiKey.lastUsedAt,
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Expires */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Expires
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {formatDate(
                  apiKey.expiresAt,
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Created */}
            {/* ============================================================ */}

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {formatDate(
                  apiKey.createdAt,
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Revoked */}
            {/* ============================================================ */}

            {apiKey.revokedAt && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Revoked
                </div>

                <div className="mt-1 text-sm text-slate-900">
                  {formatDate(
                    apiKey.revokedAt,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* Actions */}
        {/* ================================================================== */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Actions
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 px-6 py-5">
            {canRevoke &&
              apiKey.status ===
              "ACTIVE" && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmRevoke(
                      true,
                    )
                  }
                  disabled={
                    processing
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Confirmation modal */}
      {/* ==================================================================== */}

      <ConfirmModal
        open={
          confirmRevoke
        }
        title="Revoke API key?"
        description={`This action cannot be undone. "${apiKey.name}" will immediately stop working and any application using this key will no longer be able to authenticate.`}
        confirmLabel="Revoke"
        confirmingLabel="Revoking..."
        confirming={
          processing
        }
        destructive
        onConfirm={
          handleRevoke
        }
        onCancel={() => {
          if (!processing) {
            setConfirmRevoke(
              false,
            );
          }
        }}
      />
    </>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function ApiKeyStatusBadge({
  status,
}: {
  readonly status: ApiKey["status"];
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