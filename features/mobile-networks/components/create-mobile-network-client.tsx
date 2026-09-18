"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  createMobileNetwork,
  MobileNetworksApiError,
} from "@/features/mobile-networks/api/mobile-networks-api";

import type {
  Country,
} from "@/features/mobile-networks/api/mobile-networks-api";

import type {
  NumberingAllocation,
} from "@/features/mobile-networks/lib/numbering-allocations";

import {
  buildRoutingRegex,
} from "@/features/mobile-networks/lib/numbering-allocations";

import {
  NumberingAllocationBuilder,
} from "./numbering-allocation-builder";

// ============================================================================
// Types
// ============================================================================

interface CreateMobileNetworkClientProps {
  countries: readonly Country[];
}

// ============================================================================
// Create mobile network client
// ============================================================================

export default function CreateMobileNetworkClient({
  countries,
}: CreateMobileNetworkClientProps) {
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
    numberingAllocations,
    setNumberingAllocations,
  ] = useState<
    NumberingAllocation[]
  >([]);

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
  // Derived state
  // ==========================================================================

  const selectedCountry =
    countries.find(
      (country) =>
        country.code ===
        countryCode,
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

    if (!normalizedCountryCode) {
      setError(
        "Country is required.",
      );

      return;
    }

    const selectedCountry =
      countries.find(
        (country) =>
          country.code.toUpperCase() ===
          normalizedCountryCode,
      );

    if (!selectedCountry) {
      setError(
        "Please select a valid country.",
      );

      return;
    }

    if (
      selectedCountry.callingCodes.length ===
      0
    ) {
      setError(
        "The selected country does not have a configured calling code.",
      );

      return;
    }

    if (
      numberingAllocations.length ===
      0
    ) {
      setError(
        "Add at least one numbering allocation.",
      );

      return;
    }

    let routingRegex: string;

    try {
      routingRegex =
        buildRoutingRegex(
          numberingAllocations,
          selectedCountry.callingCodes,
        );
    } catch {
      setError(
        "Unable to generate the routing pattern from the numbering allocations.",
      );

      return;
    }

    if (!routingRegex) {
      setError(
        "Unable to generate a routing pattern.",
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
            selectedCountry.code,

          routingRegex:
            routingRegex,
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
              Country
          =================================================================== */}

          <div className="space-y-2">

            <label
              htmlFor="countryCode"
              className="text-sm font-medium text-slate-900"
            >
              Country
            </label>

            <select
              id="countryCode"
              name="countryCode"
              value={countryCode}
              onChange={(event) => {
                const value =
                  event.target.value;

                setCountryCode(
                  value,
                );

                setNumberingAllocations(
                  [],
                );

                setError(null);
              }}
              required
              disabled={submitting}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >

              <option value="">
                Select a country
              </option>

              {countries.map(
                (country) => (
                  <option
                    key={
                      country.code
                    }
                    value={
                      country.code
                    }
                  >
                    {country.name} (
                    {country.code})
                  </option>
                ),
              )}

            </select>

            <p className="text-xs text-slate-500">
              Select the country whose numbering allocation
              belongs to this mobile network.
            </p>

          </div>

          {/* ==================================================================
              Numbering allocations
          =================================================================== */}

          <div className="border-t border-slate-100 pt-5">

            <NumberingAllocationBuilder
              callingCodes={
                selectedCountry?.callingCodes ??
                []
              }
              value={
                numberingAllocations
              }
              onChange={
                setNumberingAllocations
              }
              disabled={
                submitting
              }
            />

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