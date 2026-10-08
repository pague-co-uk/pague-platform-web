"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

import type {
  ClientService,
  ClientServiceStatus,
  ServiceCategory,
  ServiceStatus,
} from "@/features/client-services/types/client-service.types";

interface ClientServicesClientProps {
  readonly clientId: string;

  readonly initialClientServices: readonly ClientService[];

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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getServiceStatusTone(
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

function getAssignmentStatusTone(
  status: ClientServiceStatus,
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
  status: ServiceStatus | ClientServiceStatus,
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

function getCategoryLabel(category: ServiceCategory): string {
  switch (category) {
    case "MESSAGING":
      return "Messaging";

    case "PAYMENTS":
      return "Payments";

    default:
      return category;
  }
}

export default function ClientServicesClient({
  clientId,
  initialClientServices,
  meta,
  canCreate,
  canUpdate,
  canEnable,
  canDisable,
}: ClientServicesClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<ClientService>[] = [
    {
      key: "service",
      header: "Service",
      render: (clientService) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900">
            {clientService.serviceName}
          </div>

          <div className="mt-0.5 font-mono text-xs text-slate-500">
            {clientService.serviceCode}
          </div>
        </div>
      ),
    },

    {
      key: "category",
      header: "Category",
      render: (clientService) => (
        <span className="text-sm text-slate-700">
          {getCategoryLabel(clientService.serviceCategory)}
        </span>
      ),
    },

    {
      key: "serviceStatus",
      header: "Service",
      render: (clientService) => (
        <StatusBadge
          tone={getServiceStatusTone(clientService.serviceStatus)}
          dot
        >
          {getStatusLabel(clientService.serviceStatus)}
        </StatusBadge>
      ),
    },

    {
      key: "status",
      header: "Assignment",
      render: (clientService) => (
        <StatusBadge
          tone={getAssignmentStatusTone(clientService.status)}
          dot
        >
          {getStatusLabel(clientService.status)}
        </StatusBadge>
      ),
    },

    {
      key: "createdAt",
      header: "Created",
      render: (clientService) => (
        <span className="text-sm text-slate-600">
          {formatDate(clientService.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (clientService) => (
        <div
          className="flex justify-end gap-3"
          onClick={(event) => event.stopPropagation()}
        >
          {canUpdate && (
            <Link
              href={`/clients/${clientId}/services/${clientService.serviceId}/edit`}
              className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              Edit
            </Link>
          )}

          {clientService.status === "ACTIVE" && canDisable && (
            <button
              type="button"
              className="text-sm font-medium text-red-600 transition hover:text-red-700"
              onClick={() => {
                router.push(
                  `/clients/${clientId}/services/${clientService.serviceId}`,
                );
              }}
            >
              Disable
            </button>
          )}

          {clientService.status === "DISABLED" && canEnable && (
            <button
              type="button"
              className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
              onClick={() => {
                router.push(
                  `/clients/${clientId}/services/${clientService.serviceId}`,
                );
              }}
            >
              Enable
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* Context navigation */}
      <div className="mb-6">
        <ContextAwareBackLinks
          clientHref={`/clients/${encodeURIComponent(clientId)}`}
          clientLabel="Back to client"
          showPlatformLink={false}
        />
      </div>

      {/* Page heading */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <PageHeader
          title="Client Services"
          description="Manage the services assigned to this client."
        />

        {canCreate && (
          <Link
            href={`/clients/${encodeURIComponent(clientId)}/services/new`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Add Service
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          resetParams={[
            "search",
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

      {/* Results */}
      {initialClientServices.length === 0 ? (
        <EmptyState
          title="No client services found"
          description="There are no services assigned to this client matching the current filters."
        />
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            rows={initialClientServices}
            getRowKey={(clientService) => clientService.id}
            onRowClick={(clientService) => {
              router.push(
                `/clients/${clientId}/services/${clientService.serviceId}`,
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
        </div>
      )}
    </PageContainer>
  );
}