"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/toast";

import {
  updateCountryCurrency,
} from "@/features/country-currencies/api/country-currencies-api";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import type {
  CountryCurrency,
  UpdateCountryCurrencyPayload,
} from "@/features/country-currencies/types/country-currency.types";

interface CountryCurrencyEditClientProps {
  countryCurrency: CountryCurrency;
}

export function CountryCurrencyEditClient({
  countryCurrency,
}: CountryCurrencyEditClientProps) {
  const router = useRouter();

  const { success, error } =
    useToast();

  const [isPrimary, setIsPrimary] =
    useState(
      countryCurrency.isPrimary,
    );

  const [isOfficial, setIsOfficial] =
    useState(
      countryCurrency.isOfficial,
    );

  const [saving, setSaving] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSaving(true);

    const payload: UpdateCountryCurrencyPayload =
    {
      isPrimary,
      isOfficial,
    };

    try {
      await updateCountryCurrency(
        countryCurrency.countryCode,
        countryCurrency.currencyId,
        payload,
      );

      success(
        "Country currency updated",
        `${countryCurrency.currencyCode} configuration for ${countryCurrency.countryName} was updated successfully.`,
      );

      router.push(
        `/country-currencies/${encodeURIComponent(
          countryCurrency.countryCode,
        )}/${encodeURIComponent(
          countryCurrency.currencyId,
        )}`,
      );

      router.refresh();
    } catch (caughtError) {
      error(
        "Unable to update country currency",
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ContextAwareBackLinks
        clientHref={`/country-currencies/${encodeURIComponent(
          countryCurrency.countryCode,
        )}/${encodeURIComponent(
          countryCurrency.currencyId,
        )}`}
        clientLabel={`${countryCurrency.countryName} — ${countryCurrency.currencyCode}`}
        showPlatformLink={false}
      />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Edit Country Currency
        </h1>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Update the currency configuration for{" "}
          <span className="font-medium text-slate-700">
            {countryCurrency.countryName}
          </span>
          .
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-950">
              Currency Configuration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Country and currency identifiers cannot be changed.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Country
                </label>

                <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-slate-950">
                    {countryCurrency.countryName}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {countryCurrency.countryCode}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Currency
                </label>

                <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-slate-950">
                    {countryCurrency.currencyCode}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {countryCurrency.currencyName}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Configuration
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Control how this currency is treated for the country.
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Primary currency
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Mark this as the primary currency for the country.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(event) =>
                      setIsPrimary(
                        event.target.checked,
                      )
                    }
                    disabled={saving}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                </label>

                <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Official currency
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Mark this currency as officially supported for the country.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isOfficial}
                    onChange={(event) =>
                      setIsOfficial(
                        event.target.checked,
                      )
                    }
                    disabled={saving}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Link
              href={`/country-currencies/${encodeURIComponent(
                countryCurrency.countryCode,
              )}/${encodeURIComponent(
                countryCurrency.currencyId,
              )}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}