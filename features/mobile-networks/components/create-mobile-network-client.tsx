"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  createMobileNetwork,
  MobileNetworksApiError,
} from "@/features/mobile-networks/api/mobile-networks-api";

// ============================================================================
// Create mobile network client
// ============================================================================

export default function CreateMobileNetworkClient() {
  const router =
    useRouter();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    publicId,
    setPublicId,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    code,
    setCode,
  ] = useState("");

  const [
    countryCode,
    setCountryCode,
  ] = useState("");

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

    const trimmedPublicId =
      publicId.trim();

    const trimmedName =
      name.trim();

    const trimmedCode =
      code.trim();

    const normalizedCountryCode =
      countryCode
        .trim()
        .toUpperCase();

    if (!trimmedPublicId) {
      setError(
        "Public ID is required.",
      );
      return;
    }

    if (!trimmedName) {
      setError(
        "Network name is required.",
      );
      return;
    }

    if (!trimmedCode) {
      setError(
        "Network code is required.",
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
      const mobileNetwork =
        await createMobileNetwork({
          publicId:
            trimmedPublicId,
          name:
            trimmedName,
          code:
            trimmedCode,
          countryCode:
            normalizedCountryCode,
        });

      router.push(
        `/mobile-networks/${encodeURIComponent(
          mobileNetwork.id,
        )}`,
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
          "Unable to create mobile network. Please try again.",
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
          href="/mobile-networks"
          className="text-sm text-slate-500 transition hover:text-slate-900"
        >
          ← Mobile Networks
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Create mobile network
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a mobile network to the Pague routing
          platform.
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
              Public ID
          =================================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="publicId"
              className="text-sm font-medium text-slate-900"
            >
              Public ID
            </label>

            <input
              id="publicId"
              name="publicId"
              type="text"
              value={publicId}
              onChange={(
                event,
              ) =>
                setPublicId(
                  event.target.value,
                )
              }
              maxLength={20}
              required
              disabled={submitting}
              placeholder="e.g. MNO-MW-01"
              autoComplete="off"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="text-xs text-slate-500">
              A unique public identifier for this
              mobile network.
            </p>
          </div>

          {/* ==================================================================
              Name
          =================================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-900"
            >
              Network name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(
                event,
              ) =>
                setName(
                  event.target.value,
                )
              }
              maxLength={100}
              required
              disabled={submitting}
              placeholder="e.g. Airtel Malawi"
              autoComplete="organization"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* ==================================================================
              Code
          =================================================================== */}

          <div className="space-y-2">
            <label
              htmlFor="code"
              className="text-sm font-medium text-slate-900"
            >
              Network code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(
                event,
              ) =>
                setCode(
                  event.target.value,
                )
              }
              maxLength={50}
              required
              disabled={submitting}
              placeholder="e.g. AIRTEL-MW"
              autoComplete="off"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="text-xs text-slate-500">
              The unique internal code used to identify
              the network.
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
        </div>

        {/* ====================================================================
            Actions
        ===================================================================== */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/mobile-networks"
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
              ? "Creating..."
              : "Create mobile network"}
          </button>
        </div>
      </form>
    </div>
  );
}