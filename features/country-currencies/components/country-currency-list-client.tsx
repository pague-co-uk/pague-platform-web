"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

import type {
  CountryCurrency,
  CountryCurrencyListResponse,
} from "@/features/country-currencies/types/country-currency.types";

interface CountryCurrencyListClientProps {
  initialData: CountryCurrencyListResponse | null;
  canCreate: boolean;
}

export function CountryCurrencyListClient({
  initialData,
  canCreate,
}: CountryCurrencyListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search =
    searchParams.get("search") ?? "";

  const countryCode =
    searchParams.get("countryCode") ?? "";

  const currencyId =
    searchParams.get("currencyId") ?? "";

  const isPrimary =
    searchParams.get("isPrimary") ?? "";

  const isOfficial =
    searchParams.get("isOfficial") ?? "";

  const page = parsePositiveInteger(
    searchParams.get("page"),
    1,
  );

  const pageSize = parsePositiveInteger(
    searchParams.get("pageSize"),
    20,
  );

  const handleRowClick = (
    countryCurrency: CountryCurrency,
  ) => {
    router.push(
      `/country-currencies/${countryCurrency.countryCode}/${countryCurrency.currencyId}`,
    );
  };

  if (!initialData) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <ErrorState
          title="Unable to load country currencies"
          description="There was a problem loading the country currency relationships."
        >
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
        </ErrorState>
      </div>
    );
  }

  const { items, meta } = initialData;

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Country Currencies
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the currencies associated with each country.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/country-currencies/new"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add country currency
          </Link>
        )}
      </div>

      <FilterBar
        resetParams={[
          "search",
          "countryCode",
          "currencyId",
          "isPrimary",
          "isOfficial",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search country or currency..."
          defaultValue={search}
        />

        <FilterSelect
          name="isPrimary"
          placeholder="Primary status"
          options={[
            {
              value: "true",
              label: "Primary",
            },
            {
              value: "false",
              label: "Non-primary",
            },
          ]}
        />

        <FilterSelect
          name="isOfficial"
          placeholder="Official status"
          options={[
            {
              value: "true",
              label: "Official",
            },
            {
              value: "false",
              label: "Non-official",
            },
          ]}
        />
      </FilterBar>

      {items.length === 0 ? (
        <EmptyState
          title="No country currencies found"
          description={
            search ||
              countryCode ||
              currencyId ||
              isPrimary ||
              isOfficial
              ? "Try adjusting your filters."
              : "No country currency relationships have been configured yet."
          }
        >
          {canCreate &&
            !search &&
            !countryCode &&
            !currencyId &&
            !isPrimary &&
            !isOfficial && (
              <Link
                href="/country-currencies/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Add country currency
              </Link>
            )}
        </EmptyState>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "country",
                  header: "Country",
                  render: (
                    countryCurrency: CountryCurrency,
                  ) => (
                    <div>
                      <p className="font-medium text-slate-950">
                        {countryCurrency.countryName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {countryCurrency.countryCode}
                      </p>
                    </div>
                  ),
                },

                {
                  key: "currency",
                  header: "Currency",
                  render: (
                    countryCurrency: CountryCurrency,
                  ) => (
                    <div>
                      <p className="font-medium text-slate-950">
                        {countryCurrency.currencyCode}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {countryCurrency.currencyName}
                      </p>
                    </div>
                  ),
                },

                {
                  key: "primary",
                  header: "Primary",
                  render: (
                    countryCurrency: CountryCurrency,
                  ) => (
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
                        : "No"}
                    </StatusBadge>
                  ),
                },

                {
                  key: "official",
                  header: "Official",
                  render: (
                    countryCurrency: CountryCurrency,
                  ) => (
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
                        : "No"}
                    </StatusBadge>
                  ),
                },
              ]}
              rows={items}
              getRowKey={(countryCurrency) =>
                `${countryCurrency.countryCode}:${countryCurrency.currencyId}`
              }
              onRowClick={handleRowClick}
            />
          </div>

          <Pagination meta={meta} />
        </>
      )}
    </div>
  );
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}