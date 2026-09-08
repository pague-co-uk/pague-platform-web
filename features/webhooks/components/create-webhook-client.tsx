"use client";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

import {
  createWebhook,
  type WebhookSecretResponse,
} from "../api/webhooks-api";

interface CreateWebhookClientProps {
  clientId: string;
  clientName: string;
  clientPublicId: string;
  showPlatformBackLink: boolean;
}

export function CreateWebhookClient({
  clientId,
  clientName,
  clientPublicId,
  showPlatformBackLink,
}: CreateWebhookClientProps) {
  const [name, setName] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [createdWebhook, setCreatedWebhook] =
    useState<WebhookSecretResponse | null>(
      null,
    );

  const [copied, setCopied] =
    useState(false);

  // ==========================================================================
  // Create
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setCopied(false);

    const trimmedName =
      name.trim();

    const trimmedUrl =
      url.trim();

    if (!trimmedName) {
      setError(
        "Webhook name is required.",
      );
      return;
    }

    if (!trimmedUrl) {
      setError(
        "Webhook URL is required.",
      );
      return;
    }

    try {
      const parsedUrl =
        new URL(trimmedUrl);

      if (
        parsedUrl.protocol !==
        "http:" &&
        parsedUrl.protocol !==
        "https:"
      ) {
        setError(
          "Webhook URL must use HTTP or HTTPS.",
        );
        return;
      }
    } catch {
      setError(
        "Enter a valid webhook URL.",
      );
      return;
    }

    setCreating(true);

    try {
      const result =
        await createWebhook({
          clientId,
          name: trimmedName,
          url: trimmedUrl,
        });

      setCreatedWebhook(
        result,
      );
    } catch (error) {
      console.error(
        "[Webhooks] Failed to create webhook.",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create webhook.",
      );
    } finally {
      setCreating(false);
    }
  }

  // ==========================================================================
  // Copy secret
  // ==========================================================================

  async function handleCopySecret() {
    if (!createdWebhook) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdWebhook.secret,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "[Webhooks] Failed to copy webhook secret.",
        error,
      );

      setError(
        "Unable to copy the webhook secret.",
      );
    }
  }

  // ==========================================================================
  // Secret confirmation
  // ==========================================================================

  if (createdWebhook) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 pb-6 pt-6">
        <div className="mb-6">
          <ContextAwareBackLinks showPlatformLink={showPlatformBackLink} platformHref="/webhooks" platformLabel="Back to Webhooks" clientHref={`/clients/${encodeURIComponent(clientId)}/webhooks`} clientLabel="Back to Client Webhooks" />

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Webhook created
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The webhook endpoint has been created successfully.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">
            Save your webhook secret
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            This secret is shown only once. Store it securely before
            leaving this page.
          </p>

          <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
            <code className="block break-all text-sm text-slate-900">
              {createdWebhook.secret}
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

        <div className="mt-6 flex justify-end">
          <Link
            href={`/clients/${encodeURIComponent(
              clientId,
            )}/webhooks/${encodeURIComponent(
              createdWebhook.id,
            )}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View Webhook
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Create form
  // ==========================================================================

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-6 pt-6">
      <div className="mb-6">
        <ContextAwareBackLinks showPlatformLink={showPlatformBackLink} platformHref="/webhooks" platformLabel="Back to Webhooks" clientHref={`/clients/${encodeURIComponent(clientId)}/webhooks`} clientLabel="Back to Client Webhooks" />

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Create Webhook
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Configure an endpoint to receive webhook notifications.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Client
          </div>

          <div className="mt-1 font-medium text-slate-900">
            {clientName}
          </div>

          <div className="text-sm text-slate-500">
            {clientPublicId}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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
              disabled={creating}
              placeholder="Production webhook"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

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
              disabled={creating}
              placeholder="https://example.com/webhooks"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The endpoint must use HTTP or HTTPS.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <Link
              href={`/clients/${encodeURIComponent(
                clientId,
              )}/webhooks`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Creating..."
                : "Create Webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
