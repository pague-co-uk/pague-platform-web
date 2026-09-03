"use client";

import Link from "next/link";
import {
  useState,
} from "react";

import {
  deleteWebhook,
  disableWebhook,
  enableWebhook,
  rotateWebhookSecret,
  type Webhook,
  type WebhookSecretResponse,
} from "../api/webhooks-api";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useToast,
} from "@/components/ui/toast";

interface WebhookDetailsClientProps {
  clientId: string;
  webhook: Webhook;
  canUpdate: boolean;
  canDelete: boolean;
  canRotateSecret: boolean;
  canReadDeliveries: boolean;
}

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
  ).format(
    new Date(value),
  );
}

export function WebhookDetailsClient({
  clientId,
  webhook: initialWebhook,
  canUpdate,
  canDelete,
  canRotateSecret,
  canReadDeliveries,
}: WebhookDetailsClientProps) {
  const {
    success,
    error: showError,
  } = useToast();

  const [webhook, setWebhook] =
    useState(initialWebhook);

  const [confirmAction, setConfirmAction] =
    useState<
      | "enable"
      | "disable"
      | "rotate"
      | "delete"
      | null
    >(null);

  const [processing, setProcessing] =
    useState(false);

  const [rotatedSecret, setRotatedSecret] =
    useState<WebhookSecretResponse | null>(
      null,
    );

  const [copied, setCopied] =
    useState(false);

  // ==========================================================================
  // Lifecycle action
  // ==========================================================================

  async function handleLifecycleAction() {
    if (!confirmAction) {
      return;
    }

    setProcessing(true);

    try {
      if (
        confirmAction ===
        "enable"
      ) {
        const updated =
          await enableWebhook(
            clientId,
            webhook.id,
          );

        setWebhook(updated);

        success(
          "Webhook enabled",
          "The webhook endpoint is now enabled.",
        );
      }

      if (
        confirmAction ===
        "disable"
      ) {
        const updated =
          await disableWebhook(
            clientId,
            webhook.id,
          );

        setWebhook(updated);

        success(
          "Webhook disabled",
          "The webhook endpoint is now disabled.",
        );
      }

      if (
        confirmAction ===
        "rotate"
      ) {
        const result =
          await rotateWebhookSecret(
            clientId,
            webhook.id,
          );

        setWebhook(result);
        setRotatedSecret(result);
        setCopied(false);

        success(
          "Webhook secret rotated",
          "The previous secret is no longer valid.",
        );
      }

      if (
        confirmAction ===
        "delete"
      ) {
        await deleteWebhook(
          clientId,
          webhook.id,
        );

        success(
          "Webhook deleted",
          "The webhook endpoint has been deleted.",
        );

        window.location.href =
          `/webhooks?clientId=${encodeURIComponent(
            clientId,
          )}`;

        return;
      }
    } catch (error) {
      console.error(
        "[Webhooks] Webhook action failed.",
        error,
      );

      showError(
        "Webhook action failed",
        error instanceof Error
          ? error.message
          : "Unable to complete the requested action.",
      );
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  }

  // ==========================================================================
  // Copy rotated secret
  // ==========================================================================

  async function handleCopySecret() {
    if (!rotatedSecret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        rotatedSecret.secret,
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        2000,
      );
    } catch (error) {
      console.error(
        "[Webhooks] Failed to copy webhook secret.",
        error,
      );

      showError(
        "Copy failed",
        "Unable to copy the webhook secret.",
      );
    }
  }

  // ==========================================================================
  // Confirmation content
  // ==========================================================================

  function getConfirmTitle(): string {
    switch (confirmAction) {
      case "enable":
        return "Enable webhook?";

      case "disable":
        return "Disable webhook?";

      case "rotate":
        return "Rotate webhook secret?";

      case "delete":
        return "Delete webhook?";

      default:
        return "";
    }
  }

  function getConfirmDescription() {
    switch (confirmAction) {
      case "enable":
        return "The webhook endpoint will start receiving notifications.";

      case "disable":
        return "The webhook endpoint will stop receiving notifications until it is enabled again.";

      case "rotate":
        return "The existing secret will immediately become invalid. You will need to update your integration with the new secret.";

      case "delete":
        return "This action cannot be undone. The webhook endpoint and its configuration will be permanently deleted.";

      default:
        return undefined;
    }
  }

  function getConfirmLabel(): string {
    switch (confirmAction) {
      case "enable":
        return "Enable";

      case "disable":
        return "Disable";

      case "rotate":
        return "Rotate Secret";

      case "delete":
        return "Delete";

      default:
        return "Confirm";
    }
  }

  function getConfirmingLabel(): string {
    switch (confirmAction) {
      case "enable":
        return "Enabling...";

      case "disable":
        return "Disabling...";

      case "rotate":
        return "Rotating...";

      case "delete":
        return "Deleting...";

      default:
        return "Processing...";
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pb-6 pt-6">
        {/* ================================================================== */}
        {/* Header */}
        {/* ================================================================== */}

        <div className="relative mx-auto w-full max-w-5xl px-6 pb-6 pt-6">
          <div className="absolute -left-80 top-6">
            <Link
              href={`/webhooks?clientId=${encodeURIComponent(clientId)}`}
              className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Webhooks
            </Link>
          </div>

          <div className="mb-6">
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* existing header content */}
            </div>
          </div>

          {/* rest of the component unchanged */}
        </div>

        {/* ================================================================== */}
        {/* Secret notification */}
        {/* ================================================================== */}

        {rotatedSecret ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-sm font-semibold text-amber-900">
              Save your new webhook secret
            </h2>

            <p className="mt-1 text-sm text-amber-800">
              This secret is shown only once. Store it securely before
              leaving this page.
            </p>

            <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
              <code className="block break-all text-sm text-slate-900">
                {rotatedSecret.secret}
              </code>
            </div>

            <button
              type="button"
              onClick={handleCopySecret}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {copied
                ? "Copied"
                : "Copy Secret"}
            </button>
          </div>
        ) : null}

        {/* ================================================================== */}
        {/* Details */}
        {/* ================================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Webhook details
            </h2>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Name
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {webhook.name}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Public ID
              </div>

              <div className="mt-1 font-mono text-sm text-slate-900">
                {webhook.publicId}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Endpoint URL
              </div>

              <div className="mt-1 break-all font-mono text-sm text-slate-900">
                {webhook.url}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </div>

              <div className="mt-2">
                {webhook.enabled ? (
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
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {formatDate(
                  webhook.createdAt,
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Last updated
              </div>

              <div className="mt-1 text-sm text-slate-900">
                {formatDate(
                  webhook.updatedAt,
                )}
              </div>
            </div>
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
            {canUpdate ? (
              webhook.enabled ? (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction(
                      "disable",
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Disable
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction(
                      "enable",
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Enable
                </button>
              )
            ) : null}

            {canUpdate ? (
              <Link
                href={`/webhooks/${encodeURIComponent(
                  webhook.id,
                )}/edit?clientId=${encodeURIComponent(
                  clientId,
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </Link>
            ) : null}

            {canRotateSecret ? (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    "rotate",
                  )
                }
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Rotate Secret
              </button>
            ) : null}

            {canReadDeliveries ? (
              <Link
                href={`/webhooks/${encodeURIComponent(
                  webhook.id,
                )}/deliveries?clientId=${encodeURIComponent(
                  clientId,
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Delivery History
              </Link>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    "delete",
                  )
                }
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Confirmation modal */}
      {/* ==================================================================== */}

      <ConfirmModal
        open={
          confirmAction !== null
        }
        title={getConfirmTitle()}
        description={getConfirmDescription()}
        confirmLabel={getConfirmLabel()}
        confirmingLabel={getConfirmingLabel()}
        confirming={processing}
        destructive={
          confirmAction ===
          "delete"
        }
        onConfirm={
          handleLifecycleAction
        }
        onCancel={() => {
          if (!processing) {
            setConfirmAction(null);
          }
        }}
      />
    </>
  );
}