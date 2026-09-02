"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";


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

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";

import type {
  Connector,
  ConnectorStatus,
  PaginationMeta
} from "@/features/connectors/api/connectors-api";
import { formatDate } from "@/lib/date/format-date";

interface ConnectorsClientProps {
  initialConnectors: Connector[];
  meta: PaginationMeta;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canEnable: boolean;
  canDisable: boolean;
  canSuspend: boolean;
}

const statusOptions = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "DISABLED",
    label: "Disabled",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
  },
];

const transportOptions = [
  {
    value: "SMPP",
    label: "SMPP",
  },
  {
    value: "HTTP",
    label: "HTTP",
  },
];

function getStatusTone(
  status: ConnectorStatus,
) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;

    case "SUSPENDED":
      return "warning" as const;

    case "DISABLED":
      return "danger" as const;

    default:
      return "neutral" as const;
  }
}

function getStatusLabel(
  status: ConnectorStatus,
) {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "DISABLED":
      return "Disabled";

    case "SUSPENDED":
      return "Suspended";

    default:
      return status;
  }
}

export default function ConnectorsClient({
  initialConnectors,
  meta,
  canCreate,
  canUpdate,
  canDelete,
  canEnable,
  canDisable,
  canSuspend,
}: ConnectorsClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<Connector>[] =
    [
      {
        key: "name",
        header: "Name",
        render: (connector) => (
          <div>
            <div className="font-medium text-slate-900">
              {connector.name}
            </div>

            <div className="mt-0.5 text-xs text-slate-500">
              {connector.publicId}
            </div>
          </div>
        ),
      },
      {
        key: "code",
        header: "Code",
        render: (connector) => (
          <span className="font-mono text-sm text-slate-700">
            {connector.code}
          </span>
        ),
      },
      {
        key: "provider",
        header: "Provider",
        render: (connector) => (
          <span className="text-slate-700">
            {connector.provider}
          </span>
        ),
      },
      {
        key: "transport",
        header: "Transport",
        render: (connector) => (
          <span className="text-slate-700">
            {connector.transport}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (connector) => (
          <StatusBadge
            tone={getStatusTone(
              connector.status,
            )}
            dot
          >
            {getStatusLabel(
              connector.status,
            )}
          </StatusBadge>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (connector) =>
          formatDate(connector.createdAt)
      },
      {
        key: "actions",
        header: "Actions",
        className:
          "text-right",
        render: (connector) => (
          <div
            className="flex justify-end gap-2"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {canUpdate && (
              <Link
                href={`/connectors/${connector.id}/edit`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Edit
              </Link>
            )}
          </div>
        ),
      },
    ];

  if (initialConnectors.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Connectors"
          description="Manage the external messaging and transport connectors used by the platform."
        >
          {canCreate && (
            <Link
              href="/connectors/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              New connector
            </Link>
          )}
        </PageHeader>

        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search connectors..."
          />

          <FilterSelect
            name="status"
            placeholder="Status"
            options={statusOptions}
          />

          <FilterSelect
            name="transport"
            placeholder="Transport"
            options={transportOptions}
          />

          <FilterSearch
            name="provider"
            placeholder="Provider"
          />
        </FilterBar>

        <EmptyState
          title="No connectors found"
          description="There are no connectors matching the current filters."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Connectors"
        description="Manage the external messaging and transport connectors used by the platform."
      >
        {canCreate && (
          <Link
            href="/connectors/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            New connector
          </Link>
        )}
      </PageHeader>

      <FilterBar>
        <FilterSearch
          name="search"
          placeholder="Search connectors..."
        />

        <FilterSelect
          name="status"
          placeholder="Status"
          options={statusOptions}
        />

        <FilterSelect
          name="transport"
          placeholder="Transport"
          options={transportOptions}
        />

        <FilterSearch
          name="provider"
          placeholder="Provider"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={initialConnectors}
        getRowKey={(connector) =>
          connector.id
        }
        onRowClick={(connector) =>
          router.push(
            `/connectors/${connector.id}`,
          )
        }
      />

      <Pagination meta={meta} />
    </PageContainer>
  );
}