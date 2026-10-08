"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { useToast } from "@/components/ui/toast";

import {
  createCurrency,
  CurrenciesApiError,
} from "@/features/currencies/api/currencies-api";

import type {
  CreateCurrencyPayload,
} from "@/features/currencies/types/currency.types";

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const NUMERIC_CODE_PATTERN = /^[0-9]{3}$/;

export function CurrencyCreateClient() {
  const router = useRouter();

  const { success, error: showError } = useToast();

  const [code, setCode] = useState("");
  const [numericCode, setNumericCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimalDigits, setDecimalDigits] = useState("2");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const normalizedCode = code.trim().toUpperCase();
    const normalizedNumericCode = numericCode.trim();
    const normalizedName = name.trim();
    const normalizedSymbol = symbol.trim();
    const parsedDecimalDigits = Number(decimalDigits);

    if (!normalizedCode) {
      setFormError("Currency code is required.");
      return;
    }

    if (!CURRENCY_CODE_PATTERN.test(normalizedCode)) {
      setFormError(
        "Currency code must be exactly 3 uppercase letters.",
      );
      return;
    }

    if (normalizedNumericCode) {
      if (!NUMERIC_CODE_PATTERN.test(normalizedNumericCode)) {
        setFormError(
          "Numeric code must be exactly 3 digits.",
        );
        return;
      }
    }

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

    const payload: CreateCurrencyPayload = {
      code: normalizedCode,
      ...(normalizedNumericCode
        ? {
          numericCode: normalizedNumericCode,
        }
        : {}),
      name: normalizedName,
      ...(normalizedSymbol
        ? {
          symbol: normalizedSymbol,
        }
        : {}),
      decimalDigits: parsedDecimalDigits,
    };

    setSubmitting(true);

    try {
      const created = await createCurrency(payload);

      success(
        "Currency created.",
        `${created.code} has been added to the currency catalogue.`,
      );

      router.push(
        `/currencies/${encodeURIComponent(created.id)}`,
      );
    } catch (error) {
      const message =
        error instanceof CurrenciesApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to create currency.";

      setFormError(message);

      showError(
        "Failed to create currency.",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref="/currencies"
          clientLabel="Currencies"
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Create Currency
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Add a currency to the payment platform catalogue.
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
                Define the currency code, display name, symbol,
                and amount precision.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="currency-code"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Code
                  </label>

                  <input
                    id="currency-code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                          .toUpperCase()
                          .replace(/[^A-Z]/g, "")
                          .slice(0, 3),
                      )
                    }
                    disabled={submitting}
                    maxLength={3}
                    placeholder="e.g. USD"
                    autoComplete="off"
                    className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm uppercase text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    ISO-style 3-letter uppercase currency code.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="numeric-code"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Numeric code
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="numeric-code"
                    name="numericCode"
                    type="text"
                    inputMode="numeric"
                    value={numericCode}
                    onChange={(event) =>
                      setNumericCode(
                        event.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 3),
                      )
                    }
                    disabled={submitting}
                    maxLength={3}
                    placeholder="e.g. 840"
                    autoComplete="off"
                    className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Three-digit numeric currency code.
                  </p>
                </div>
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
                  placeholder="e.g. United States Dollar"
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
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
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

                  <p className="mt-1.5 text-xs text-slate-500">
                    Display symbol used for the currency.
                  </p>
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
                    Number of decimal places used for amounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/currencies"
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
                  ? "Creating..."
                  : "Create Currency"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}