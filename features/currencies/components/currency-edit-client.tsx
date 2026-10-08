"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { useToast } from "@/components/ui/toast";

import {
  CurrenciesApiError,
  updateCurrency,
} from "@/features/currencies/api/currencies-api";

import type {
  Currency,
  UpdateCurrencyPayload,
} from "@/features/currencies/types/currency.types";

interface CurrencyEditClientProps {
  currency: Currency;
}

export function CurrencyEditClient({
  currency,
}: CurrencyEditClientProps) {
  const router = useRouter();

  const { success, error: showError } = useToast();

  const [name, setName] = useState(currency.name);
  const [symbol, setSymbol] = useState(currency.symbol ?? "");
  const [decimalDigits, setDecimalDigits] = useState(
    String(currency.decimalDigits),
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const normalizedName = name.trim();
    const normalizedSymbol = symbol.trim();
    const parsedDecimalDigits = Number(decimalDigits);

    if (!normalizedName) {
      setFormError("Currency name is required.");
      return;
    }

    if (normalizedName.length > 100) {
      setFormError(
        "Currency name must not exceed 100 characters.",
      );
      return;
    }

    if (normalizedSymbol.length > 10) {
      setFormError(
        "Symbol must not exceed 10 characters.",
      );
      return;
    }

    if (
      !Number.isInteger(parsedDecimalDigits) ||
      parsedDecimalDigits < 0 ||
      parsedDecimalDigits > 8
    ) {
      setFormError(
        "Decimal digits must be a whole number between 0 and 8.",
      );
      return;
    }

    const payload: UpdateCurrencyPayload = {
      name: normalizedName,
      ...(normalizedSymbol
        ? { symbol: normalizedSymbol }
        : {}),
      decimalDigits: parsedDecimalDigits,
    };

    setSubmitting(true);

    try {
      const updated = await updateCurrency(
        currency.id,
        payload,
      );

      success(
        "Currency updated.",
        `${updated.code} has been updated successfully.`,
      );

      router.push(
        `/currencies/${encodeURIComponent(updated.id)}`,
      );
      router.refresh();
    } catch (error) {
      const message =
        error instanceof CurrenciesApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to update currency.";

      setFormError(message);

      showError(
        "Failed to update currency.",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const detailsHref = `/currencies/${encodeURIComponent(
    currency.id,
  )}`;

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref={detailsHref}
          clientLabel="Currency"
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Edit Currency
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Update the configuration for{" "}
            <span className="font-medium text-slate-700">
              {currency.code}
            </span>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Currency information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the display name, symbol, and amount
                precision.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="currency-code"
                  className="block text-sm font-medium text-slate-700"
                >
                  Code
                </label>

                <input
                  id="currency-code"
                  type="text"
                  value={currency.code}
                  disabled
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Currency codes cannot be changed after creation.
                </p>
              </div>

              <div>
                <label
                  htmlFor="numeric-code"
                  className="block text-sm font-medium text-slate-700"
                >
                  Numeric code
                </label>

                <input
                  id="numeric-code"
                  type="text"
                  value={currency.numericCode ?? "—"}
                  disabled
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Numeric codes are defined when the currency is
                  created and cannot be changed here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="currency-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="currency-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={submitting}
                  maxLength={100}
                  autoComplete="off"
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="currency-symbol"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Symbol
                  </label>

                  <input
                    id="currency-symbol"
                    name="symbol"
                    type="text"
                    value={symbol}
                    onChange={(event) =>
                      setSymbol(event.target.value)
                    }
                    disabled={submitting}
                    maxLength={10}
                    placeholder="e.g. $"
                    autoComplete="off"
                    className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="decimal-digits"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Decimal digits
                  </label>

                  <input
                    id="decimal-digits"
                    name="decimalDigits"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={8}
                    step={1}
                    value={decimalDigits}
                    onChange={(event) =>
                      setDecimalDigits(event.target.value)
                    }
                    disabled={submitting}
                    className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Must be between 0 and 8 decimal places.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href={detailsHref}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}