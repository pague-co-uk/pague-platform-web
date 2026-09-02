"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  MobileNetworksApiError,
  updateMobileNetworkPrefix,
  type MobileNetworkPrefix,
} from "@/features/mobile-networks/api/mobile-networks-api";

// ============================================================================
// Edit mobile network prefix client
// ============================================================================

interface EditMobileNetworkPrefixClientProps {
  mobileNetworkId: string;
  mobileNetworkName: string;
  prefix: MobileNetworkPrefix;
}

export default function EditMobileNetworkPrefixClient({
  mobileNetworkId,
  mobileNetworkName,
  prefix: initialPrefix,
}: EditMobileNetworkPrefixClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    prefix,
    setPrefix,
  ] = useState(
    initialPrefix.prefix,
  );

  const [
    countryCode,
    setCountryCode,
  ] = useState(
    initialPrefix.countryCode,
  );

  const [
    enabled,
    setEnabled,
  ] = useState(
    initialPrefix.enabled,
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
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const trimmedPrefix =
      prefix.trim();

    const normalizedCountryCode =
      countryCode
        .trim()
        .toUpperCase();

    if (!trimmedPrefix) {
      setError(
        "Prefix is required.",
      );
      return;
    }

    if (
      !/^[A-Z]{2}$/.test(
        normalizedCountryCode,
      )
    ) {
      setError(
        "Country code must contain exactly two letters.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await updateMobileNetworkPrefix(
        mobileNetworkId,
        initialPrefix.id,
        {
          prefix:
            trimmedPrefix,
          countryCode:
            normalizedCountryCode,
          enabled,
        },
      );

      router.push(
        `/mobile-networks/${encodeURIComponent(
          mobileNetworkId,
        )}/prefixes`,
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof
        MobileNetworksApiError
      ) {
        setError(
          error.message,
        );
      } else {
        setError(
          "Unable to update prefix. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* ====================================================================
          Header
      ===================================================================== */}

      <div className="mb-6">
        <Link
          href={`/mobile-networks/${encodeURIComponent(
            mobileNetworkId,
          )}/prefixes`}
          className="text-sm text-slate-500 transition hover:text-slate-900"
        >
          ← {mobileNetworkName} prefixes
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Edit mobile network prefix
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the prefix configuration for{" "}
          {mobileNetworkName}.
        </p>
      </div>

      {/* ====================================================================
          Form
      ===================================================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-5">
          {/* ==================================================================
              Error
          =================================================================== */}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* ==================================================================
              Prefix
          =================================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="prefix"
              className="text-sm font-medium text-slate-900"
            >
              Prefix
            </label>

            <input
              id="prefix"
              name="prefix"
              type="text"
              value={prefix}
              onChange={(
                event,
              ) =>
                setPrefix(
                  event.target.value,
                )
              }
              maxLength={20}
              required
              disabled={submitting}
              placeholder="e.g. 0888"
              autoComplete="off"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="text-xs text-slate-500">
              The phone-number prefix used to identify
              this mobile network.
            </p>
          </div>

          {/* ==================================================================
              Country code
          =================================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="countryCode"
              className="text-sm font-medium text-slate-900"
            >
              Country code
            </label>

            <input
              id="countryCode"
              name="countryCode"
              type="text"
              value={countryCode}
              onChange={(
                event,
              ) =>
                setCountryCode(
                  event.target.value
                    .replace(
                      /[^a-zA-Z]/g,
                      "",
                    )
                    .slice(0, 2)
                    .toUpperCase(),
                )
              }
              maxLength={2}
              required
              disabled={submitting}
              placeholder="MW"
              autoComplete="country"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="text-xs text-slate-500">
              Two-letter country code, for example MW.
            </p>
          </div>

          {/* ==================================================================
              Enabled
          =================================================================== */}

          <div className="rounded-lg border border-slate-200 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(
                  event,
                ) =>
                  setEnabled(
                    event.target.checked,
                  )
                }
                disabled={submitting}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Enable prefix
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  Allow this prefix to be used for
                  routing.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ====================================================================
            Actions
        ===================================================================== */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href={`/mobile-networks/${encodeURIComponent(
              mobileNetworkId,
            )}/prefixes`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}