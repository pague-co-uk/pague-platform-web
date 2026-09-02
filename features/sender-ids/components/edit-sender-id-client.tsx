"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  updateSenderId,
} from "../api/sender-ids-api";

import type {
  SenderId,
} from "../api/sender-ids-api";

// ============================================================================
// Types
// ============================================================================

interface EditSenderIdClientProps {
  senderId: SenderId;
}

// ============================================================================
// Edit Sender ID
// ============================================================================

export default function EditSenderIdClient({
  senderId,
}: EditSenderIdClientProps) {
  const router =
    useRouter();

  const [
    sender,
    setSender,
  ] = useState(
    senderId.sender,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const normalizedSender =
      sender.trim();

    if (!normalizedSender) {
      setError(
        "Sender ID is required.",
      );

      return;
    }

    setSubmitting(true);

    try {
      await updateSenderId(
        senderId.id,
        {
          sender:
            normalizedSender,
        },
      );

      router.push(
        `/sender-ids/${senderId.id}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Sender IDs] Unable to update Sender ID.",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update Sender ID.",
      );

      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/sender-ids/${senderId.id}`}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to Sender ID
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit Sender ID
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update the Sender ID configuration.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* ================================================================== */}
        {/* Identity */}
        {/* ================================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Sender ID
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sender ID identity and ownership.
            </p>
          </div>

          <div className="space-y-5">
            {/* ============================================================ */}
            {/* Client */}
            {/* ============================================================ */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Client
              </label>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-sm font-medium text-slate-900">
                  {
                    senderId.client
                      .displayName
                  }
                </div>

                {senderId.client
                  .companyName !==
                  senderId.client
                    .displayName && (
                    <div className="mt-0.5 text-xs text-slate-500">
                      {
                        senderId.client
                          .companyName
                      }
                    </div>
                  )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Public ID */}
            {/* ============================================================ */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Public ID
              </label>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-600">
                {
                  senderId.publicId
                }
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                The public identifier cannot be changed.
              </p>
            </div>

            {/* ============================================================ */}
            {/* Sender */}
            {/* ============================================================ */}

            <div>
              <label
                htmlFor="sender"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Sender
              </label>

              <input
                id="sender"
                name="sender"
                type="text"
                value={sender}
                onChange={(
                  event,
                ) =>
                  setSender(
                    event.target
                      .value,
                  )
                }
                maxLength={20}
                required
                disabled={
                  submitting
                }
                autoComplete="off"
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                placeholder="Enter sender ID"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Maximum 20 characters.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* Error */}
        {/* ================================================================== */}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* ================================================================== */}
        {/* Actions */}
        {/* ================================================================== */}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/sender-ids/${senderId.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              submitting
            }
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}