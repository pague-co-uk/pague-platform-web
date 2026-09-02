"use client";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

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
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  FindMobileNetworksResult,
  MobileNetwork,
} from "@/features/mobile-networks/api/mobile-networks-api";
import { formatDate } from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface MobileNetworksClientProps {
  readonly initialMobileNetworks:
  | FindMobileNetworksResult
  | null;

  readonly canCreateMobileNetworks: boolean;
}

// ============================================================================
// Mobile Networks client
// ============================================================================

export default function MobileNetworksClient({
  initialMobileNetworks,
  canCreateMobileNetworks,
}: MobileNetworksClientProps) {
  const router =
    useRouter();

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<MobileNetwork>[] =
    [
      {
        key: "name",
        header: "Network",
        render: (network) => (
          <div className="min-w-0">
            <Link
              href={`/mobile-networks/${encodeURIComponent(
                network.id,
              )}`}
              className="font-medium text-slate-900 transition hover:text-blue-600"
            >
              {network.name}
            </Link>

            <p className="mt-0.5 text-xs text-slate-500">
              {network.code}
            </p>
          </div>
        ),
      },

      {
        key: "publicId",
        header: "Network ID",
        render: (network) => (
          <code className="font-mono text-xs text-slate-600">
            {network.publicId}
          </code>
        ),
      },

      {
        key: "countryCode",
        header: "Country",
        render: (network) => (
          <span className="text-sm text-slate-600">
            {network.countryCode}
          </span>
        ),
      },

      {
        key: "prefixes",
        header: "Prefixes",
        render: (network) => (
          <span className="text-sm text-slate-600">
            {network.prefixes.length}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (network) => (
          <MobileNetworkStatusBadge
            status={
              network.status
            }
          />
        ),
      },

      {
        key: "createdAt",
        header: "Created",
        className:
          "hidden md:table-cell",
        render: (network) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              network.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "",
        className:
          "text-right",
        render: (network) => (
          <Link
            href={`/mobile-networks/${encodeURIComponent(
              network.id,
            )}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            View
          </Link>
        ),
      },
    ];

  // ==========================================================================
  // Error
  // ==========================================================================

  if (!initialMobileNetworks) {
    return (
      <PageContainer>
        <PageHeader
          title="Mobile Networks"
          description="Manage mobile networks and their numbering prefixes."
        />

        <div className="mt-5 rounded-xl border border-slate-200 bg-white">
          <ErrorState
            title="Unable to load mobile networks"
            description="We couldn't load the mobile network list."
          >
            <button
              type="button"
              onClick={() =>
                router.refresh()
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Mobile Networks"
        description="Manage mobile networks and their numbering prefixes."
      >
        {canCreateMobileNetworks && (
          <Link
            href="/mobile-networks/new"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Create mobile network
          </Link>
        )}
      </PageHeader>

      {/* ======================================================================
          Filters
      ======================================================================= */}

      <div className="mt-5">
        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search mobile networks..."
          />

          <FilterSelect
            name="status"
            placeholder="All statuses"
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "Disabled",
                value: "DISABLED",
              },
            ]}
          />
        </FilterBar>
      </div>

      {/* ======================================================================
          Table
      ======================================================================= */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {initialMobileNetworks
          .items.length === 0 ? (
          <EmptyState
            title="No mobile networks found"
            description="There are no mobile networks matching the current filters."
          >
            {canCreateMobileNetworks && (
              <Link
                href="/mobile-networks/new"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white"
              >
                Create mobile network
              </Link>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              initialMobileNetworks.items
            }
            getRowKey={(
              network,
            ) =>
              network.id
            }
            onRowClick={(
              network,
            ) =>
              router.push(
                `/mobile-networks/${encodeURIComponent(
                  network.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* ======================================================================
          Pagination
      ======================================================================= */}

      {initialMobileNetworks.meta
        .total > 0 && (
          <div className="mt-4">
            <Pagination
              meta={
                initialMobileNetworks.meta
              }
            />
          </div>
        )}
    </PageContainer>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function MobileNetworkStatusBadge({
  status,
}: {
  readonly status:
  | "ACTIVE"
  | "DISABLED";
}) {
  switch (status) {
    case "ACTIVE":
      return (
        <StatusBadge
          tone="success"
        >
          Active
        </StatusBadge>
      );

    case "DISABLED":
      return (
        <StatusBadge
          tone="danger"
        >
          Disabled
        </StatusBadge>
      );
  }
}
