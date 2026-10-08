"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

import {
  ErrorState,
} from "@/components/ui/error-state";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  SortButton,
} from "@/components/ui/sort-button";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  Currency,
  CurrencyListResponse,
} from "@/features/currencies/types/currency.types";

interface CurrencyListClientProps {
  readonly initialData: CurrencyListResponse | null;
  readonly canCreate: boolean;
}

export function CurrencyListClient({
  initialData,
  canCreate,
}: CurrencyListClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<Currency>[] = [
    {
      key: "code",
      header: "Currency",
      render: (currency) => (
        <div className="min-w-0">
          <Link
            href={`/currencies/${encodeURIComponent(currency.id)}`}
            className="font-medium text-slate-900 transition hover:text-blue-600"
          >
            {currency.code}
          </Link>

          <p className="mt-0.5 text-sm text-slate-500">
            {currency.name}
          </p>
        </div>
      ),
    },

    {
      key: "numericCode",
      header: "Numeric Code",
      render: (currency) => (
        <code className="font-mono text-xs text-slate-600">
          {currency.numericCode ?? "—"}
        </code>
      ),
    },

    {
      key: "symbol",
      header: "Symbol",
      render: (currency) => (
        <span className="text-sm text-slate-600">
          {currency.symbol ?? "—"}
        </span>
      ),
    },

    {
      key: "decimalDigits",
      header: "Decimals",
      render: (currency) => (
        <span className="text-sm text-slate-600">
          {currency.decimalDigits}
        </span>
      ),
    },

    {
      key: "active",
      header: "Status",
      render: (currency) => (
        <CurrencyStatusBadge
          active={currency.active}
        />
      ),
    },

    {
      key: "createdAt",
      header: "Created",
      render: (currency) => (
        <span className="text-sm text-slate-500">
          {formatDate(currency.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (currency) => (
        <Link
          href={`/currencies/${encodeURIComponent(currency.id)}`}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          View
        </Link>
      ),
    },
  ];

  if (!initialData) {
    return (
      <PageContainer>
        <PageHeader
          title="Currencies"
          description="Manage the currencies supported by the Pague platform."
        />

        <div className="mt-5 rounded-xl border border-slate-200 bg-white">
          <ErrorState
            title="Unable to load currencies"
            description="We couldn't load the currency list."
          >
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Currencies"
          description="Manage the currencies supported by the Pague platform."
        />

        {canCreate && (
          <Link
            href="/currencies/new"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Add currency
          </Link>
        )}
      </div>

      <div className="mt-5">
        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search currencies..."
          />

          <FilterSelect
            name="active"
            placeholder="All statuses"
            options={[
              {
                label: "Active",
                value: "true",
              },
              {
                label: "Disabled",
                value: "false",
              },
            ]}
          />
        </FilterBar>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {initialData.items.length === 0 ? (
          <EmptyState
            title="No currencies found"
            description="There are no currencies matching the current filters."
          >
            {canCreate && (
              <Link
                href="/currencies/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Add currency
              </Link>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={columns}
            rows={initialData.items}
            getRowKey={(currency) => currency.id}
            onRowClick={(currency) =>
              router.push(
                `/currencies/${encodeURIComponent(currency.id)}`,
              )
            }
          />
        )}
      </div>

      {initialData.meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Sort:</span>

            <SortButton
              field="code"
              label="Code"
              defaultDirection="asc"
            />

            <SortButton
              field="name"
              label="Name"
            />

            <SortButton
              field="createdAt"
              label="Created"
              defaultDirection="desc"
            />
          </div>

          <Pagination meta={initialData.meta} />
        </div>
      )}
    </PageContainer>
  );
}

function CurrencyStatusBadge({
  active,
}: {
  readonly active: boolean;
}) {
  if (active) {
    return (
      <StatusBadge tone="success">
        Active
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="danger">
      Disabled
    </StatusBadge>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}