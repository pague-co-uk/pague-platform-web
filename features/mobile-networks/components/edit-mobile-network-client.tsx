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
  MobileNetworksApiError,
  updateMobileNetwork,
} from "@/features/mobile-networks/api/mobile-networks-api";

import {
  useToast,
} from "@/components/ui/toast";

import {
  NumberingAllocationBuilder,
} from "./numbering-allocation-builder";

import type {
  NumberingAllocation,
} from "@/features/mobile-networks/lib/numbering-allocations";

import {
  buildRoutingRegex,
} from "@/features/mobile-networks/lib/numbering-allocations";

// ============================================================================
// Types
// ============================================================================

interface EditMobileNetworkClientProps {
  readonly mobileNetwork: {
    id: string;
    publicId: string;
    name: string;
    code: string;
    countryCode: string;
    routingRegex: string | null;
  };

  readonly countries: readonly {
    code: string;
    name: string;
    callingCodes: string[];
  }[];
}

// ============================================================================
// Edit Mobile Network client
// ============================================================================

export default function EditMobileNetworkClient({
  mobileNetwork,
  countries,
}: EditMobileNetworkClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // Form state
  // ==========================================================================

  const [name, setName] =
    useState(
      mobileNetwork.name,
    );

  const [code, setCode] =
    useState(
      mobileNetwork.code,
    );

  const [countryCode, setCountryCode] =
    useState(
      mobileNetwork.countryCode,
    );

  const [
    numberingAllocations,
    setNumberingAllocations,
  ] = useState<
    NumberingAllocation[]
  >([]);

  const [
    routingConfigurationChanged,
    setRoutingConfigurationChanged,
  ] = useState(false);

  const [formError, setFormError] =
    useState<string | null>(
      null,
    );

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const selectedCountry =
    countries.find(
      (country) =>
        country.code.toUpperCase() ===
        countryCode
          .trim()
          .toUpperCase(),
    );

  const generatedRoutingRegex =
    numberingAllocations.length > 0 &&
      selectedCountry &&
      selectedCountry.callingCodes.length > 0
      ? buildRoutingRegex(
        numberingAllocations,
        selectedCountry.callingCodes,
      )
      : "";

  // ==========================================================================
  // Country change
  // ==========================================================================

  function handleCountryChange(
    value: string,
  ) {
    setCountryCode(
      value,
    );

    setNumberingAllocations(
      [],
    );

    setRoutingConfigurationChanged(
      true,
    );

    setFormError(null);
  }

  // ==========================================================================
  // Allocation change
  // ==========================================================================

  function handleAllocationsChange(
    allocations: NumberingAllocation[],
  ) {
    setNumberingAllocations(
      allocations,
    );

    setRoutingConfigurationChanged(
      true,
    );

    setFormError(null);
  }

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const trimmedName =
      name.trim();

    const trimmedCode =
      code.trim();

    const normalizedCountryCode =
      countryCode
        .trim()
        .toUpperCase();

    if (!trimmedName) {
      setFormError(
        "Mobile network name is required.",
      );

      return;
    }

    if (!trimmedCode) {
      setFormError(
        "Mobile network code is required.",
      );

      return;
    }

    if (!normalizedCountryCode) {
      setFormError(
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
      setFormError(
        "Please select a valid country.",
      );

      return;
    }

    // ------------------------------------------------------------------------
    // Routing configuration
    //
    // If the administrator has changed the routing configuration, a new
    // allocation set is required. The generated regex completely replaces
    // the existing routingRegex.
    // ------------------------------------------------------------------------

    let routingRegex:
      | string
      | undefined;

    if (
      routingConfigurationChanged
    ) {
      if (
        selectedCountry.callingCodes.length ===
        0
      ) {
        setFormError(
          "The selected country does not have a configured calling code.",
        );

        return;
      }

      if (
        numberingAllocations.length ===
        0
      ) {
        setFormError(
          "Add at least one numbering allocation to replace the current routing configuration.",
        );

        return;
      }

      try {
        routingRegex =
          buildRoutingRegex(
            numberingAllocations,
            selectedCountry.callingCodes,
          );
      } catch {
        setFormError(
          "Unable to generate the routing pattern from the numbering allocations.",
        );

        return;
      }

      if (!routingRegex) {
        setFormError(
          "Unable to generate a routing pattern.",
        );

        return;
      }
    }

    setSubmitting(true);

    try {
      await updateMobileNetwork(
        mobileNetwork.id,
        {
          name:
            trimmedName,

          code:
            trimmedCode,

          countryCode:
            normalizedCountryCode,

          ...(routingConfigurationChanged
            ? {
              routingRegex,
            }
            : {}),
        },
      );

      success(
        "Mobile network updated",
        `${trimmedName} was updated successfully.`,
      );

      router.push(
        `/mobile-networks/${mobileNetwork.id}`,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof
          MobileNetworksApiError
          ? err.message
          : "Unable to update the mobile network.";

      setFormError(
        message,
      );

      showError(
        "Update failed",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <main className="mx-auto w-full max-w-2xl">

      {/* ====================================================================
          Back link
      ===================================================================== */}

      <div className="mb-6">

        <Link
          href={`/mobile-networks/${mobileNetwork.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to mobile network
        </Link>

      </div>

      {/* ====================================================================
          Header
      ===================================================================== */}

      <div className="mb-6">

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit mobile network
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the details for{" "}
          {mobileNetwork.name}.
        </p>

      </div>

      {/* ====================================================================
          Form
      ===================================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >

        <div className="space-y-6 p-6">

          {/* ==================================================================
              Error
          =================================================================== */}

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          {/* ==================================================================
              Public ID
          =================================================================== */}

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
              value={
                mobileNetwork.publicId
              }
              disabled
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The public ID cannot be changed.
            </p>

          </div>

          {/* ==================================================================
              Name
          =================================================================== */}

          <div>

            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              disabled={
                submitting
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

          </div>

          {/* ==================================================================
              Code
          =================================================================== */}

          <div>

            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              maxLength={50}
              required
              disabled={
                submitting
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

          </div>

          {/* ==================================================================
              Country
          =================================================================== */}

          <div>

            <label
              htmlFor="countryCode"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Country
            </label>

            <select
              id="countryCode"
              name="countryCode"
              value={
                countryCode
              }
              onChange={(event) =>
                handleCountryChange(
                  event.target.value,
                )
              }
              required
              disabled={
                submitting
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >

              <option value="">
                Select country
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
                    {
                      country.code
                    }
                    )
                  </option>
                ),
              )}

            </select>

            <p className="mt-1.5 text-xs text-slate-500">
              Changing the country also requires you
              to define a new numbering allocation.
            </p>

          </div>

          {/* ==================================================================
              Existing routing configuration
          =================================================================== */}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

            <div className="text-sm font-medium text-slate-700">
              Current routing pattern
            </div>

            {mobileNetwork.routingRegex ? (
              <code className="mt-2 block break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                {
                  mobileNetwork.routingRegex
                }
              </code>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No routing pattern is currently
                configured.
              </p>
            )}

          </div>

          {/* ==================================================================
              Routing configuration
          =================================================================== */}

          <div className="border-t border-slate-100 pt-5">

            <div className="mb-4">

              <h2 className="text-sm font-medium text-slate-900">
                Routing configuration
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Define the numbering allocations for
                this network. Saving changes here will
                completely replace the current routing
                pattern with the pattern generated from
                these allocations.
              </p>

            </div>

            {/* ----------------------------------------------------------------
                Replacement warning
            ----------------------------------------------------------------- */}

            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">

              <p className="text-xs font-medium text-amber-800">
                Changing the routing configuration
                replaces the existing routing pattern.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Make sure the allocations below represent
                the complete numbering ranges that should
                route to this network.
              </p>

            </div>

            <NumberingAllocationBuilder
              callingCodes={
                selectedCountry?.callingCodes ??
                []
              }
              value={
                numberingAllocations
              }
              onChange={
                handleAllocationsChange
              }
              disabled={
                submitting
              }
            />

          </div>

          {/* ==================================================================
              Generated pattern
          =================================================================== */}

          {routingConfigurationChanged &&
            generatedRoutingRegex && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div className="text-xs font-medium text-slate-600">
                  New routing pattern
                </div>

                <code className="mt-2 block break-all rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                  {
                    generatedRoutingRegex
                  }
                </code>

                <p className="mt-2 text-xs text-slate-500">
                  This pattern will replace the current
                  routing pattern when you save.
                </p>

              </div>
            )}

        </div>

        {/* ====================================================================
            Actions
        ===================================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

          <Link
            href={`/mobile-networks/${mobileNetwork.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              submitting
            }
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : "Save changes"}
          </button>

        </div>

      </form>

    </main>
  );
}