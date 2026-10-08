"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  DataTable,
  type DataTableColumn,
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
  StatusBadge,
} from "@/components/ui/status-badge";

import type {
  Service,
  ServiceCategory,
  ServiceStatus,
} from "@/features/services/api/services-api";

interface ServicesClientProps {
  initialServices: readonly Service[];

  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  canCreateServices: boolean;
  canUpdateServices: boolean;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(new Date(value));
}

function getStatusTone(
  status: ServiceStatus,
): "success" | "danger" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "DISABLED":
      return "danger";

    default:
      return "neutral";
  }
}

function getStatusLabel(
  status: ServiceStatus,
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "DISABLED":
      return "Disabled";

    default:
      return status;
  }
}

function getCategoryLabel(
  category: ServiceCategory,
): string {
  switch (category) {
    case "MESSAGING":
      return "Messaging";

    case "PAYMENTS":
      return "Payments";

    default:
      return category;
  }
}

export default function ServicesClient({
  initialServices,
  meta,
  canCreateServices,
  canUpdateServices,
}: ServicesClientProps) {
  const router = useRouter();

  const columns:
    DataTableColumn<Service>[] = [
      {
        key: "service",
        header: "Service",
        render: (service) => (
          <div className="min-w-0">
            <div className="font-medium text-slate-900">
              {service.name}
            </div>

            <div className="font-mono text-xs text-slate-500">
              {service.code}
            </div>
          </div>
        ),
      },

      {
        key: "category",
        header: "Category",
        render: (service) => (
          <span className="text-sm text-slate-700">
            {getCategoryLabel(
              service.category,
            )}
          </span>
        ),
      },

      {
        key: "description",
        header: "Description",
        render: (service) => (
          <span className="block max-w-md truncate text-sm text-slate-600">
            {service.description ||
              "—"}
          </span>
        ),
      },

      {
        key: "status",
        header: "Status",
        render: (service) => (
          <StatusBadge
            tone={getStatusTone(
              service.status,
            )}
            dot
          >
            {getStatusLabel(
              service.status,
            )}
          </StatusBadge>
        ),
      },

      {
        key: "createdAt",
        header: "Created",
        render: (service) => (
          <span className="text-sm text-slate-600">
            {formatDate(
              service.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (service) => (
          <div
            className="flex justify-end"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {canUpdateServices && (
              <Link
                href={`/services/${service.id}/edit`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Edit
              </Link>
            )}
          </div>
        ),
      },
    ];

  return (
    <PageContainer>
      <PageHeader
        title="Services"
        description="Manage the services available across the Pague platform."
      >
        {canCreateServices && (
          <Link
            href="/services/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Create Service
          </Link>
        )}
      </PageHeader>

      <FilterBar
        resetParams={[
          "search",
          "category",
          "status",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search services..."
          className="min-w-[240px] flex-1"
        />

        <FilterSelect
          name="category"
          placeholder="All categories"
          options={[
            {
              label: "Messaging",
              value: "MESSAGING",
            },
            {
              label: "Payments",
              value: "PAYMENTS",
            },
          ]}
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

      {initialServices.length ===
        0 ? (
        <EmptyState
          title="No services found"
          description="There are no services matching the current filters."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={initialServices}
            getRowKey={(service) =>
              service.id
            }
            onRowClick={(service) => {
              router.push(
                `/services/${service.id}`,
              );
            }}
          />

          <Pagination
            meta={{
              page: meta.page,
              pageSize: meta.pageSize,
              total: meta.total,
              totalPages: meta.totalPages,
            }}
          />
        </>
      )}
    </PageContainer>
  );
}