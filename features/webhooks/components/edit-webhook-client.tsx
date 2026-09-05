"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  updateWebhook,
  type UpdateWebhookInput,
  type Webhook,
} from "../api/webhooks-api";

import { useToast } from "@/components/ui/toast";

interface EditWebhookClientProps {
  clientId: string;
  clientName: string;
  webhook: Webhook;
}

export function EditWebhookClient({
  clientId,
  clientName,
  webhook,
}: EditWebhookClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(webhook.name);
  const [url, setUrl] = useState(webhook.url);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // Update
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setError("Webhook name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError(
        "Webhook name must be 100 characters or fewer.",
      );
      return;
    }

    if (!trimmedUrl) {
      setError("Webhook URL is required.");
      return;
    }

    if (trimmedUrl.length > 2048) {
      setError(
        "Webhook URL must be 2048 characters or fewer.",
      );
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        setError(
          "Webhook URL must use HTTP or HTTPS.",
        );
        return;
      }
    } catch {
      setError("Enter a valid webhook URL.");
      return;
    }

    const input: UpdateWebhookInput = {
      clientId,
      name: trimmedName,
      url: trimmedUrl,
    };

    setUpdating(true);

    try {
      await updateWebhook(input, webhook.id);

      toast.success(
        "Webhook updated",
        "The webhook endpoint has been updated successfully.",
      );

      router.push(
        `/clients/${encodeURIComponent(
          clientId,
        )}/webhooks/${encodeURIComponent(
          webhook.id,
        )}`,
      );
    } catch (error) {
      console.error(
        "[Webhooks] Failed to update webhook.",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to update webhook.";

      setError(message);

      toast.error(
        "Update failed",
        message,
      );
    } finally {
      setUpdating(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="px-6 pb-6 pt-6">
      {/* ==================================================================== */}
      {/* Back Navigation                                                       */}
      {/* ==================================================================== */}

      <div className="mb-6">
        <Link
          href={`/clients/${encodeURIComponent(
            clientId,
          )}/webhooks/${encodeURIComponent(
            webhook.id,
          )}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Webhook
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* Edit Content                                                          */}
      {/* ==================================================================== */}

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Edit Webhook
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update the webhook endpoint configuration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {/* ================================================================= */}
          {/* Client                                                             */}
          {/* ================================================================= */}

          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Client
            </div>

            <div className="mt-1 font-medium text-slate-900">
              {clientName}
            </div>

            <div className="text-sm text-slate-500">
              {clientId}
            </div>
          </div>

          {/* ================================================================= */}
          {/* Form                                                               */}
          {/* ================================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* Name */}

            <div>
              <label
                htmlFor="webhook-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              <input
                id="webhook-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                maxLength={100}
                disabled={updating}
                placeholder="Production webhook"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* URL */}

            <div>
              <label
                htmlFor="webhook-url"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Endpoint URL
              </label>

              <input
                id="webhook-url"
                type="url"
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                maxLength={2048}
                disabled={updating}
                placeholder="https://example.com/webhooks"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                The endpoint must use HTTP or HTTPS.
              </p>
            </div>

            {/* Actions */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <Link
                href={`/clients/${encodeURIComponent(
                  clientId,
                )}/webhooks/${encodeURIComponent(
                  webhook.id,
                )}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}