"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

import {
  deleteCountryCurrency,
} from "@/features/country-currencies/api/country-currencies-api";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import type { CountryCurrency } from "@/features/country-currencies/types/country-currency.types";
import { formatDate } from "@/lib/date/format-date";

interface CountryCurrencyDetailsClientProps {
  countryCurrency: CountryCurrency;
  canUpdate: boolean;
  canDelete: boolean;
}

export function CountryCurrencyDetailsClient({
  countryCurrency,
  canUpdate,
  canDelete,
}: CountryCurrencyDetailsClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteCountryCurrency(
        countryCurrency.countryCode,
        countryCurrency.currencyId,
      );

      success(
        "Country currency deleted",
        `${countryCurrency.currencyCode} is no longer configured for ${countryCurrency.countryName}.`,
      );

      router.push(
        "/country-currencies",
      );
      router.refresh();
    } catch (caughtError) {
      error(
        "Unable to delete country currency",
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref="/country-currencies"
          clientLabel="Country Currencies"
          showPlatformLink={false}
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {countryCurrency.countryName} —{" "}
              {countryCurrency.currencyCode}
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              View and manage the currency configuration for this country.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canUpdate && (
              <Link
                href={`/country-currencies/${encodeURIComponent(
                  countryCurrency.countryCode,
                )}/${encodeURIComponent(
                  countryCurrency.currencyId,
                )}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() =>
                  setDeleteOpen(true)
                }
                className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">
                Currency Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Details of the country-currency relationship.
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <DetailField
                label="Country"
                value={
                  <div>
                    <p className="font-medium text-slate-950">
                      {countryCurrency.countryName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {countryCurrency.countryCode}
                    </p>
                  </div>
                }
              />

              <DetailField
                label="Currency"
                value={
                  <div>
                    <p className="font-medium text-slate-950">
                      {countryCurrency.currencyCode}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {countryCurrency.currencyName}
                    </p>
                  </div>
                }
              />

              <DetailField
                label="Primary"
                value={
                  <StatusBadge
                    tone={
                      countryCurrency.isPrimary
                        ? "success"
                        : "neutral"
                    }
                    dot
                  >
                    {countryCurrency.isPrimary
                      ? "Primary"
                      : "Not primary"}
                  </StatusBadge>
                }
              />

              <DetailField
                label="Official"
                value={
                  <StatusBadge
                    tone={
                      countryCurrency.isOfficial
                        ? "success"
                        : "neutral"
                    }
                    dot
                  >
                    {countryCurrency.isOfficial
                      ? "Official"
                      : "Not official"}
                  </StatusBadge>
                }
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">
                Record Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Relationship record metadata.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <DetailField
                label="Currency ID"
                value={
                  <span className="break-all font-mono text-xs text-slate-700">
                    {countryCurrency.currencyId}
                  </span>
                }
              />

              <DetailField
                label="Created"
                value={formatDate(
                  countryCurrency.createdAt,
                )}
              />

              <DetailField
                label="Last updated"
                value={formatDate(
                  countryCurrency.updatedAt,
                )}
              />
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete country currency?"
        description={`This will remove ${countryCurrency.currencyCode} as a configured currency for ${countryCurrency.countryName}. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting..."
        confirming={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteOpen(false);
          }
        }}
        destructive
      />
    </>
  );
}

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
}

function DetailField({
  label,
  value,
}: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-2 text-sm text-slate-900">
        {value}
      </dd>
    </div>
  );
}