"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { useToast } from "@/components/ui/toast";

import {
  CountryCurrenciesApiError,
  createCountryCurrency,
} from "@/features/country-currencies/api/country-currencies-api";

interface CountryCurrencyCreateClientProps {
  countries: Array<{
    code: string;
    name: string;
  }>;

  currencies: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

export function CountryCurrencyCreateClient({
  countries,
  currencies,
}: CountryCurrencyCreateClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [countryCode, setcountryCode] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [isPrimary, setIsPrimary] =
    useState(false);
  const [isOfficial, setIsOfficial] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [errors, setErrors] = useState<{
    countryCode?: string;
    currencyId?: string;
  }>({});

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};

    if (!countryCode) {
      nextErrors.countryCode =
        "Country is required.";
    }

    if (!currencyId) {
      nextErrors.currencyId =
        "Currency is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const result =
        await createCountryCurrency({
          countryCode,
          currencyId,
          isPrimary,
          isOfficial,
        });

      toast.success(
        "Country currency created",
        "The country currency relationship has been created successfully.",
      );

      router.push(
        `/country-currencies/${result.countryCode}/${result.currencyId}`,
      );
      router.refresh();
    } catch (error) {
      if (
        error instanceof
        CountryCurrenciesApiError
      ) {
        toast.error(
          "Unable to create country currency",
          error.message,
        );
      } else {
        toast.error(
          "Unable to create country currency",
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ContextAwareBackLinks
        clientHref="/country-currencies"
        clientLabel="Back to country currencies"
        showPlatformLink={false}
      />

      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Add Country Currency
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Associate a currency with a
            country and configure its primary
            and official status.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-950">
                Country Currency Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the country and currency
                for this relationship.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="space-y-2">
                <label
                  htmlFor="countryCode"
                  className="block text-sm font-medium text-slate-900"
                >
                  Country
                </label>

                <select
                  id="countryCode"
                  name="countryCode"
                  value={countryCode}
                  onChange={(event) => {
                    setcountryCode(
                      event.target.value,
                    );

                    if (errors.countryCode) {
                      setErrors((current) => ({
                        ...current,
                        countryCode: undefined,
                      }));
                    }
                  }}
                  disabled={submitting}
                  className="block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    Select a country
                  </option>

                  {countries.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                    >
                      {country.name} (
                      {country.code})
                    </option>
                  ))}
                </select>

                {errors.countryCode && (
                  <p className="text-sm text-red-600">
                    {errors.countryCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="currencyId"
                  className="block text-sm font-medium text-slate-900"
                >
                  Currency
                </label>

                <select
                  id="currencyId"
                  name="currencyId"
                  value={currencyId}
                  onChange={(event) => {
                    setCurrencyId(
                      event.target.value,
                    );

                    if (errors.currencyId) {
                      setErrors((current) => ({
                        ...current,
                        currencyId: undefined,
                      }));
                    }
                  }}
                  disabled={submitting}
                  className="block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    Select a currency
                  </option>

                  {currencies.map((currency) => (
                    <option
                      key={currency.id}
                      value={currency.id}
                    >
                      {currency.code} —{" "}
                      {currency.name}
                    </option>
                  ))}
                </select>

                {errors.currencyId && (
                  <p className="text-sm text-red-600">
                    {errors.currencyId}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(event) =>
                        setIsPrimary(
                          event.target.checked,
                        )
                      }
                      disabled={submitting}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                    />

                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        Primary currency
                      </span>

                      <span className="mt-0.5 block text-sm text-slate-500">
                        Mark this as the primary
                        currency for the
                        country.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isOfficial}
                      onChange={(event) =>
                        setIsOfficial(
                          event.target.checked,
                        )
                      }
                      disabled={submitting}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                    />

                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        Official currency
                      </span>

                      <span className="mt-0.5 block text-sm text-slate-500">
                        Mark this currency as
                        officially recognised
                        for the country.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/country-currencies",
                  )
                }
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Creating..."
                  : "Create country currency"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}