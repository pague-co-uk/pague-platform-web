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
import { EmptyState } from "@/components/ui/empty-state";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

import type {
  Route as RouteResponse,
  RouteStatus,
} from "@/features/routes/api/routes-api";

interface RouteClientOption {
  id: string;
  companyName: string;
  displayName: string;
}

interface RouteMobileNetworkOption {
  id: string;
  name: string;
  code: string;
  countryCode: string;
}

interface RouteConnectorOption {
  id: string;
  name: string;
  code: string;
  provider: string;
  transport: string;
}

interface RoutesClientProps {
  initialRoutes: RouteResponse[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  clients: RouteClientOption[];
  mobileNetworks: RouteMobileNetworkOption[];
  connectors: RouteConnectorOption[];

  canCreateRoutes: boolean;
  canUpdateRoutes: boolean;
  canDeleteRoutes: boolean;
  canEnableRoutes: boolean;
  canDisableRoutes: boolean;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getStatusTone(
  status: RouteStatus,
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

function getStatusLabel(status: RouteStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "DISABLED":
      return "Disabled";

    default:
      return status;
  }
}

export default function RoutesClient({
  initialRoutes,
  meta,
  clients,
  mobileNetworks,
  connectors,
  canCreateRoutes,
  canUpdateRoutes,
  canDeleteRoutes,
  canEnableRoutes,
  canDisableRoutes,
}: RoutesClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<RouteResponse>[] = [
    {
      key: "publicId",
      header: "Route",
      render: (route) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900">
            {route.publicId}
          </div>

          <div className="text-xs text-slate-500">
            Priority {route.priority}
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (route) =>
        route.client ? (
          <div className="min-w-0">
            <div className="font-medium text-slate-900">
              {route.client.companyName}
            </div>

            <div className="text-xs text-slate-500">
              {route.client.displayName}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "mobileNetwork",
      header: "Mobile Network",
      render: (route) =>
        route.mobileNetwork ? (
          <div className="min-w-0">
            <div className="font-medium text-slate-900">
              {route.mobileNetwork.name}
            </div>

            <div className="text-xs text-slate-500">
              {route.mobileNetwork.code} ·{" "}
              {route.mobileNetwork.countryCode}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "connector",
      header: "Connector",
      render: (route) =>
        route.connector ? (
          <div className="min-w-0">
            <div className="font-medium text-slate-900">
              {route.connector.name}
            </div>

            <div className="text-xs text-slate-500">
              {route.connector.provider} ·{" "}
              {route.connector.transport}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (route) => (
        <StatusBadge
          tone={getStatusTone(route.status)}
          dot
        >
          {getStatusLabel(route.status)}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (route) => (
        <span className="text-sm text-slate-600">
          {formatDate(route.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (route) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          {canUpdateRoutes && (
            <Link
              href={`/routes/${route.id}/edit`}
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
        title="Routes"
        description="Manage client routing priorities between mobile networks and connectors."
      >
        {canCreateRoutes && (
          <Link
            href="/routes/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Create Route
          </Link>
        )}
      </PageHeader>

      <FilterBar
        resetParams={[
          "search",
          "clientId",
          "mobileNetworkId",
          "connectorId",
          "status",
          "page",
        ]}
      >
        <FilterSearch
          name="search"
          placeholder="Search routes..."
          className="min-w-[240px] flex-1"
        />

        <FilterSelect
          name="clientId"
          placeholder="All clients"
          options={clients.map((client) => ({
            label: client.companyName,
            value: client.id,
          }))}
        />

        <FilterSelect
          name="mobileNetworkId"
          placeholder="All mobile networks"
          options={mobileNetworks.map((network) => ({
            label: `${network.name} (${network.code})`,
            value: network.id,
          }))}
        />

        <FilterSelect
          name="connectorId"
          placeholder="All connectors"
          options={connectors.map((connector) => ({
            label: `${connector.name} (${connector.provider})`,
            value: connector.id,
          }))}
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

      {initialRoutes.length === 0 ? (
        <EmptyState
          title="No routes found"
          description="There are no routes matching the current filters."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={initialRoutes}
            getRowKey={(route) => route.id}
            onRowClick={(route) => {
              router.push(`/routes/${route.id}`);
            }}
          />

          <Pagination meta={meta} />
        </>
      )}
    </PageContainer>
  );
}