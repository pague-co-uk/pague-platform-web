"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

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
  findClients,
} from "@/features/clients/api/clients-api";

import {
  createSenderId,
} from "../api/sender-ids-api";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

export default function CreateSenderIdClient() {
  const router = useRouter();

  const [
    clients,
    setClients,
  ] = useState<ClientSummary[]>([]);

  const [
    clientsLoading,
    setClientsLoading,
  ] = useState(true);

  const [
    clientId,
    setClientId,
  ] = useState("");

  const [
    publicId,
    setPublicId,
  ] = useState("");

  const [
    sender,
    setSender,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      setClientsLoading(true);
      setError(null);

      try {
        const response =
          await findClients({
            page: 1,
            pageSize: 100,
          });

        if (!cancelled) {
          setClients(
            response.items,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              error,
              "Unable to load clients.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setClientsLoading(false);
        }
      }
    }

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const normalizedPublicId =
      publicId.trim();

    const normalizedSender =
      sender.trim();

    if (!clientId) {
      setError(
        "Please select a client.",
      );
      return;
    }

    if (!normalizedPublicId) {
      setError(
        "Please enter a public ID.",
      );
      return;
    }

    if (
      normalizedPublicId.length >
      20
    ) {
      setError(
        "Public ID must not exceed 20 characters.",
      );
      return;
    }

    if (!normalizedSender) {
      setError(
        "Please enter a Sender ID.",
      );
      return;
    }

    if (
      normalizedSender.length >
      20
    ) {
      setError(
        "Sender ID must not exceed 20 characters.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const created =
        await createSenderId({
          clientId,
          publicId:
            normalizedPublicId,
          sender:
            normalizedSender,
        });

      router.push(
        `/sender-ids/${encodeURIComponent(created.id)}`,
      );

      router.refresh();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to create Sender ID.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create Sender ID"
        description="Register a new Sender ID for a client."
      >
        <button
          type="button"
          onClick={() =>
            router.push(
              "/sender-ids",
            )
          }
          disabled={submitting}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back to Sender IDs
        </button>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              Sender ID details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Provide the Sender ID information below.
              New Sender IDs are created in Pending status
              and must be approved before use.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="space-y-6 px-6 py-6">
            {/* ==============================================================
                Client
            ============================================================== */}

            <div>
              <label
                htmlFor="clientId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Client
              </label>

              <select
                id="clientId"
                name="clientId"
                value={clientId}
                onChange={(event) =>
                  setClientId(
                    event.target.value,
                  )
                }
                disabled={
                  clientsLoading ||
                  submitting
                }
                className="block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {clientsLoading
                    ? "Loading clients..."
                    : "Select a client"}
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.displayName}
                      {client.companyName !==
                        client.displayName
                        ? ` — ${client.companyName}`
                        : ""}
                    </option>
                  ),
                )}
              </select>

              {!clientsLoading &&
                clients.length ===
                0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    No clients are available.
                  </p>
                )}
            </div>

            {/* ==============================================================
                Public ID
            ============================================================== */}

            <div>
              <label
                htmlFor="publicId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Public ID
              </label>

              <input
                id="publicId"
                name="publicId"
                type="text"
                value={publicId}
                onChange={(event) =>
                  setPublicId(
                    event.target.value,
                  )
                }
                maxLength={20}
                disabled={submitting}
                placeholder="e.g. SID-001"
                className="block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Maximum 20 characters.
              </p>
            </div>

            {/* ==============================================================
                Sender
            ============================================================== */}

            <div>
              <label
                htmlFor="sender"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sender ID
              </label>

              <input
                id="sender"
                name="sender"
                type="text"
                value={sender}
                onChange={(event) =>
                  setSender(
                    event.target.value,
                  )
                }
                maxLength={20}
                disabled={submitting}
                placeholder="e.g. VIBRANT"
                className="block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Maximum 20 characters.
              </p>
            </div>
          </div>

          {/* ================================================================
              Actions
          ================================================================ */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/sender-ids",
                )
              }
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                clientsLoading ||
                clients.length === 0
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {submitting
                ? "Creating..."
                : "Create Sender ID"}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}