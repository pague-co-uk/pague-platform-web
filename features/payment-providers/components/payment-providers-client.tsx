"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  DataTable,
} from "@/components/ui/data-table";

import type {
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";


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

import type {
  PaymentProvider,
  PaymentProviderStatus,
} from "../types/payment-provider.types";

interface PaymentProvidersClientProps {
  readonly initialProviders: readonly PaymentProvider[];
  readonly meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  readonly canCreate: boolean;
  readonly canUpdate: boolean;
  readonly canEnable: boolean;
  readonly canDisable: boolean;
}

function getStatusTone(
  status: PaymentProviderStatus,
): "success" | "neutral" {
  return status === "ACTIVE"
    ? "success"
    : "neutral";
}

export default function PaymentProvidersClient({
  initialProviders,
  meta,
  canCreate,
  canUpdate,
}: PaymentProvidersClientProps) {
  const router = useRouter();

  const columns: readonly DataTableColumn<PaymentProvider>[] =
    [
      {
        key: "provider",
        header: "Provider",
        render: (provider) => (
          <div className="min-w-0">
            <Link
              href={`/payment-providers/${encodeURIComponent(
                provider.id,
              )}`}
              className="font-medium text-slate-900 hover:text-slate-600"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {provider.name}
            </Link>

            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {provider.code}
            </p>
          </div>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (provider) => (
          <span className="line-clamp-2 text-sm text-slate-600">
            {provider.description ||
              "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: (
          <SortButton
            field="status"
            label="Status"
          />
        ),
        render: (provider) => (
          <StatusBadge
            tone={getStatusTone(
              provider.status,
            )}
          >
            {provider.status}
          </StatusBadge>
        ),
      },
      {
        key: "createdAt",
        header: (
          <SortButton
            field="createdAt"
            label="Created"
            defaultDirection="desc"
          />
        ),
        render: (provider) => (
          <span className="text-sm text-slate-600">
            {new Date(
              provider.createdAt,
            ).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className:
          "w-24 text-right",
        render: (provider) => (
          <div className="flex justify-end">
            <Link
              href={`/payment-providers/${encodeURIComponent(
                provider.id,
              )}`}
              className="text-sm font-medium text-slate-700 hover:text-slate-950"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              View
            </Link>
          </div>
        ),
      },
    ];

  if (
    initialProviders.length === 0
  ) {
    return (
      <PageContainer>
        <PageHeader
          title="Payment Providers"
          description="Manage the payment providers available to the platform."
        >
          {canCreate && (
            <Link
              href="/payment-providers/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Provider
            </Link>
          )}
        </PageHeader>

        <FilterBar
          resetParams={[
            "search",
            "status",
          ]}
        >
          <FilterSearch
            name="search"
            placeholder="Search providers..."
          />

          <FilterSelect
            name="status"
            placeholder="All statuses"
            options={[
              {
                value: "ACTIVE",
                label: "Active",
              },
              {
                value: "DISABLED",
                label: "Disabled",
              },
            ]}
          />
        </FilterBar>

        <EmptyState
          title="No payment providers found"
          description="There are no payment providers matching the current filters."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Payment Providers"
        description="Manage the payment providers available to the platform."
      >
        {canCreate && (
          <Link
            href="/payment-providers/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add Provider
          </Link>
        )}
      </PageHeader>

      <FilterBar
        resetParams={[
          "search",
          "status",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search providers..."
        />

        <FilterSelect
          name="status"
          placeholder="All statuses"
          options={[
            {
              value: "ACTIVE",
              label: "Active",
            },
            {
              value: "DISABLED",
              label: "Disabled",
            },
          ]}
        />
      </FilterBar>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={initialProviders}
          getRowKey={(provider) =>
            provider.id
          }
          onRowClick={(provider) => {
            router.push(
              `/payment-providers/${encodeURIComponent(
                provider.id,
              )}`,
            );
          }}
          getRowClassName={() =>
            "cursor-pointer"
          }
        />
      </div>

      <div className="mt-6">
        <Pagination meta={meta} />
      </div>
    </PageContainer>
  );
}