"use client";

import {
  FormEvent,
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

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import {
  useToast,
} from "@/components/ui/toast";

import {
  createApiKey,
  type ApiKeyCreatedResponse,
} from "@/features/api-keys/api/api-keys-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface CreateApiKeyClientProps {
  readonly client: Client;
  readonly showPlatformBackLink: boolean;
}

// ============================================================================
// Capabilities
// ============================================================================
//
// Keep this registry aligned with the backend ApiKeyCapability registry.
// ============================================================================

const API_KEY_CAPABILITIES = [
  {
    value: "messages.create",
    label: "Send messages",
    description:
      "Allow the API key to submit outbound messages.",
  },
] as const;

// ============================================================================
// Component
// ============================================================================

export default function CreateApiKeyClient({
  client,
  showPlatformBackLink,
}: CreateApiKeyClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    name,
    setName,
  ] = useState("");

  const [
    expiresAt,
    setExpiresAt,
  ] = useState("");

  const [
    capabilities,
    setCapabilities,
  ] = useState<string[]>([]);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    createdKey,
    setCreatedKey,
  ] = useState<ApiKeyCreatedResponse | null>(
    null,
  );

  // ==========================================================================
  // URLs
  // ==========================================================================

  const clientName =
    client.displayName ||
    client.companyName;

  const clientUrl =
    `/clients/${encodeURIComponent(
      client.id,
    )}`;

  const apiKeysUrl =
    `/clients/${encodeURIComponent(
      client.id,
    )}/api-keys`;

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      showError(
        "API key name required",
        "Enter a name for the API key.",
      );

      return;
    }

    if (capabilities.length === 0) {
      showError(
        "Capability required",
        "Select at least one capability for this API key.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const result =
        await createApiKey({
          clientId:
            client.id,
          name:
            trimmedName,
          capabilities,
          expiresAt:
            expiresAt
              ? new Date(
                `${expiresAt}T23:59:59.999Z`,
              ).toISOString()
              : undefined,
        });

      setCreatedKey(result);

      success(
        "API key created",
        "The API key has been created successfully.",
      );
    } catch (error) {
      console.error(
        "[API Keys] Unable to create API key.",
        error,
      );

      showError(
        "Unable to create API key",
        error instanceof Error
          ? error.message
          : "Unable to create API key.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Capability toggle
  // ==========================================================================

  function toggleCapability(
    capability: string,
  ) {
    setCapabilities((current) =>
      current.includes(capability)
        ? current.filter(
          (value) =>
            value !== capability,
        )
        : [
          ...current,
          capability,
        ],
    );
  }

  // ==========================================================================
  // Created state
  // ==========================================================================

  if (createdKey) {
    return (
      <CreatedApiKey
        client={client}
        keyName={name.trim()}
        result={createdKey}
        onDone={() => {
          router.push(apiKeysUrl);
          router.refresh();
        }}
        showPlatformBackLink={showPlatformBackLink}
      />
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Back link
      ======================================================================= */}

      <div className="mb-5">
        <ContextAwareBackLinks showPlatformLink={showPlatformBackLink} platformHref="/api-keys" platformLabel="Back to API Keys" clientHref={apiKeysUrl} clientLabel="Back to Client API Keys" />
      </div>

      {/* ======================================================================
          Centered content
      ======================================================================= */}

      <div className="mx-auto w-full max-w-2xl">

        {/* ====================================================================
            Header
        ===================================================================== */}

        <div className="mb-5">
          <PageHeader
            title="Create API key"
            description={`Create an API credential for ${clientName}.`}
          />
        </div>

        {/* ====================================================================
            Client
        ===================================================================== */}

        <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Client
            </h2>
          </div>

          <div className="px-4 py-3.5 sm:px-5">
            <Link
              href={clientUrl}
              className="text-sm font-medium text-slate-900 transition hover:text-blue-600"
            >
              {clientName}
            </Link>

            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
              {client.id}
            </p>
          </div>
        </section>

        {/* ====================================================================
            Form
        ===================================================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          {/* ==================================================================
              Key details
          =================================================================== */}

          <section>
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-900">
                API key details
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Define the identity and lifetime of the API credential.
              </p>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5">

              {/* ==============================================================
                  Name
              =============================================================== */}

              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  maxLength={100}
                  required
                  placeholder="Production API"
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Use a name that identifies where this key will be used.
                </p>
              </div>

              {/* ==============================================================
                  Expiration
              =============================================================== */}

              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-xs font-medium text-slate-700"
                >
                  Expiration date
                </label>

                <input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(event) =>
                    setExpiresAt(
                      event.target.value,
                    )
                  }
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Leave empty for a key that does not expire.
                </p>
              </div>
            </div>
          </section>

          {/* ==================================================================
              Capabilities
          =================================================================== */}

          <section className="border-t border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Capabilities
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Select the operations this API key is allowed to perform.
              </p>
            </div>

            <div className="px-4 py-4 sm:px-5">
              <div className="space-y-2.5">
                {API_KEY_CAPABILITIES.map(
                  (capability) => {
                    const selected =
                      capabilities.includes(
                        capability.value,
                      );

                    return (
                      <label
                        key={
                          capability.value
                        }
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                          selected
                            ? "border-blue-300 bg-blue-50/50"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleCapability(
                              capability.value,
                            )
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900">
                            {
                              capability.label
                            }
                          </span>

                          <span className="mt-0.5 block text-xs leading-4 text-slate-500">
                            {
                              capability.description
                            }
                          </span>

                          <span className="mt-1.5 block font-mono text-[10px] text-slate-400">
                            {
                              capability.value
                            }
                          </span>
                        </span>
                      </label>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {/* ==================================================================
              Actions
          =================================================================== */}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <Link
              href={apiKeysUrl}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating…"
                : "Create API key"}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Created API key
// ============================================================================

interface CreatedApiKeyProps {
  readonly client: Client;
  readonly keyName: string;
  readonly result: ApiKeyCreatedResponse;
  readonly onDone: () => void;
  readonly showPlatformBackLink: boolean;
}

function CreatedApiKey({
  client,
  keyName,
  result,
  onDone,
  showPlatformBackLink,
}: CreatedApiKeyProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(
        result.apiKey,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "[API Keys] Unable to copy API key.",
        error,
      );
    }
  }

  const clientName =
    client.displayName ||
    client.companyName;

  const apiKeysUrl =
    `/clients/${encodeURIComponent(
      client.id,
    )}/api-keys`;

  return (
    <PageContainer>
      {/* ======================================================================
          Back
      ======================================================================= */}

      <div className="mb-5">
        <ContextAwareBackLinks showPlatformLink={showPlatformBackLink} platformHref="/api-keys" platformLabel="Back to API Keys" clientHref={apiKeysUrl} clientLabel="Back to Client API Keys" />
      </div>

      {/* ======================================================================
          Centered content
      ======================================================================= */}

      <div className="mx-auto w-full max-w-2xl">

        <div className="mb-5">
          <PageHeader
            title="API key created"
            description="Copy the secret now. It will not be shown again."
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* ==================================================================
              Warning
          =================================================================== */}

          <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 sm:px-5">
            <div className="flex items-start gap-3">
              <WarningIcon />

              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Save this API key now
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-amber-800">
                  This is the only time the complete API key will be displayed.
                  Store it somewhere secure before continuing.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================================
              Details
          =================================================================== */}

          <div className="space-y-4 px-4 py-4 sm:px-5">

            {/* ================================================================
                Name
            ================================================================= */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Name
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-900">
                {keyName}
              </p>
            </div>

            {/* ================================================================
                Public ID
            ================================================================= */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Public ID
              </p>

              <p className="mt-0.5 break-all font-mono text-xs text-slate-700">
                {result.publicId}
              </p>
            </div>

            {/* ================================================================
                API key
            ================================================================= */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                API key
              </p>

              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 break-all rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs leading-5 text-slate-800">
                  {result.apiKey}
                </code>

                <button
                  type="button"
                  onClick={copyApiKey}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>
              </div>
            </div>

            {/* ================================================================
                Metadata
            ================================================================= */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Prefix
                </p>

                <p className="mt-0.5 font-mono text-xs text-slate-700">
                  {result.prefix}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Expires
                </p>

                <p className="mt-0.5 text-sm text-slate-700">
                  {result.expiresAt
                    ? new Date(
                      result.expiresAt,
                    ).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

            </div>

            {/* ================================================================
                Client
            ================================================================= */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Client
              </p>

              <p className="mt-0.5 text-sm text-slate-700">
                {clientName}
              </p>
            </div>

            {/* ================================================================
                Security notice
            ================================================================= */}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
              <p className="text-xs leading-5 text-slate-600">
                Treat this API key like a password. Do not commit it to
                source control, expose it in browser code, or include it in
                application logs.
              </p>
            </div>
          </div>

          {/* ==================================================================
              Actions
          =================================================================== */}

          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={onDone}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Icons
// ============================================================================

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
      aria-hidden="true"
    >
      <path
        d="M12 9v4"
        strokeLinecap="round"
      />

      <path
        d="M12 17h.01"
        strokeLinecap="round"
      />

      <path
        d="M10.3 4.4 2.7 17.6a2 2 0 0 0 1.73 3h15.14a2 2 0 0 0 1.73-3L13.7 4.4a2 2 0 0 0-3.4 0Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
