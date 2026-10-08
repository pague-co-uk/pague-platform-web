"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useToast,
} from "@/components/ui/toast";

import {
  disableCurrency,
  enableCurrency,
} from "@/features/currencies/api/currencies-api";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import type {
  Currency,
} from "@/features/currencies/types/currency.types";

interface CurrencyDetailsClientProps {
  readonly currency: Currency;
  readonly canUpdate: boolean;
  readonly canEnable: boolean;
  readonly canDisable: boolean;
}

export function CurrencyDetailsClient({
  currency: initialCurrency,
  canUpdate,
  canEnable,
  canDisable,
}: CurrencyDetailsClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [currency, setCurrency] =
    useState(initialCurrency);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showEnableModal, setShowEnableModal] =
    useState(false);

  const [showDisableModal, setShowDisableModal] =
    useState(false);

  async function handleEnable() {
    if (
      actionLoading ||
      !canEnable ||
      currency.active
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const updatedCurrency =
        await enableCurrency(currency.id);

      setCurrency(updatedCurrency);
      setShowEnableModal(false);

      success(
        "Currency enabled",
        `${currency.code} has been enabled successfully.`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Currencies] Unable to enable currency.",
        error,
      );

      showError(
        "Unable to enable currency",
        error instanceof Error
          ? error.message
          : "Unable to enable currency.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisable() {
    if (
      actionLoading ||
      !canDisable ||
      !currency.active
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const updatedCurrency =
        await disableCurrency(currency.id);

      setCurrency(updatedCurrency);
      setShowDisableModal(false);

      success(
        "Currency disabled",
        `${currency.code} has been disabled successfully.`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Currencies] Unable to disable currency.",
        error,
      );

      showError(
        "Unable to disable currency",
        error instanceof Error
          ? error.message
          : "Unable to disable currency.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <PageContainer>
      {/* ================================================================== */}
      {/* Back links                                                        */}
      {/* ================================================================== */}

      <ContextAwareBackLinks
        clientHref="/currencies"
        clientLabel="Back to currencies"
        showPlatformLink={false}
      />

      {/* ================================================================== */}
      {/* Page header                                                       */}
      {/* ================================================================== */}

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {currency.code}
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            View and manage this currency.
          </p>
        </div>

        {canUpdate && (
          <Link
            href={`/currencies/${encodeURIComponent(currency.id)}/edit`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Edit currency
          </Link>
        )}
      </div>

      {/* ================================================================== */}
      {/* Content                                                           */}
      {/* ================================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ================================================================== */}
        {/* Currency information                                               */}
        {/* ================================================================== */}

        <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Currency information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core information and formatting settings for this currency.
              </p>
            </div>

            <CurrencyStatusBadge
              active={currency.active}
            />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="Code"
              value={currency.code}
              mono
            />

            <DetailItem
              label="Numeric code"
              value={
                currency.numericCode ?? "—"
              }
              mono
            />

            <DetailItem
              label="Name"
              value={currency.name}
            />

            <DetailItem
              label="Symbol"
              value={
                currency.symbol ?? "—"
              }
            />

            <DetailItem
              label="Decimal digits"
              value={String(
                currency.decimalDigits,
              )}
            />

            <DetailItem
              label="Status"
              value={
                currency.active
                  ? "Active"
                  : "Disabled"
              }
            />
          </div>
        </section>

        {/* ================================================================== */}
        {/* Actions                                                            */}
        {/* ================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the availability of this currency.
          </p>

          <div className="mt-6 space-y-3">
            {!currency.active && canEnable && (
              <button
                type="button"
                onClick={() =>
                  setShowEnableModal(true)
                }
                disabled={actionLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enable currency
              </button>
            )}

            {currency.active && canDisable && (
              <button
                type="button"
                onClick={() =>
                  setShowDisableModal(true)
                }
                disabled={actionLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Disable currency
              </button>
            )}

            {!canEnable &&
              !canDisable && (
                <p className="text-sm text-slate-500">
                  You do not have permission to change this currency's status.
                </p>
              )}
          </div>
        </section>

        {/* ================================================================== */}
        {/* Record information                                                 */}
        {/* ================================================================== */}

        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Record information
          </h2>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="Currency ID"
              value={currency.id}
              mono
            />

            <DetailItem
              label="Created"
              value={formatDateTime(
                currency.createdAt,
              )}
            />

            <DetailItem
              label="Last updated"
              value={formatDateTime(
                currency.updatedAt,
              )}
            />
          </div>
        </section>
      </div>

      {/* ================================================================== */}
      {/* Enable confirmation                                                */}
      {/* ================================================================== */}

      <ConfirmModal
        open={showEnableModal}
        title="Enable currency?"
        description={`This will make ${currency.code} available for use on the platform.`}
        confirmLabel="Enable currency"
        confirmingLabel="Enabling..."
        confirming={actionLoading}
        onConfirm={handleEnable}
        onCancel={() =>
          !actionLoading &&
          setShowEnableModal(false)
        }
        destructive={false}
      />

      {/* ================================================================== */}
      {/* Disable confirmation                                               */}
      {/* ================================================================== */}

      <ConfirmModal
        open={showDisableModal}
        title="Disable currency?"
        description={`This will prevent ${currency.code} from being used while it is disabled.`}
        confirmLabel="Disable currency"
        confirmingLabel="Disabling..."
        confirming={actionLoading}
        onConfirm={handleDisable}
        onCancel={() =>
          !actionLoading &&
          setShowDisableModal(false)
        }
        destructive
      />
    </PageContainer>
  );
}

// ============================================================================
// Detail item
// ============================================================================

function DetailItem({
  label,
  value,
  mono = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd
        className={
          mono
            ? "mt-1.5 break-all font-mono text-sm text-slate-900"
            : "mt-1.5 text-sm text-slate-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function CurrencyStatusBadge({
  active,
}: {
  readonly active: boolean;
}) {
  return active ? (
    <StatusBadge tone="success">
      Active
    </StatusBadge>
  ) : (
    <StatusBadge tone="danger">
      Disabled
    </StatusBadge>
  );
}

// ============================================================================
// Date formatting
// ============================================================================

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}