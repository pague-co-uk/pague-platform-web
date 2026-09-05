"use client";

import { useRouter } from "next/navigation";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { FilterBar, FilterSearch } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import type {
  RoleMeta,
  RoleSummary,
} from "@/features/access-control/api/roles-api";

interface RolesClientProps {
  roles: readonly RoleSummary[];
  meta: RoleMeta;
  canCreate: boolean;
}

export default function RolesClient({
  roles,
  meta,
  canCreate,
}: RolesClientProps) {
  const router = useRouter();

  const columns: DataTableColumn<RoleSummary>[] = [
    {
      key: "name",
      header: "Role",
      render: (role) => (
        <div className="min-w-0">
          <div className="font-medium text-slate-900">
            {role.name}
          </div>

          {role.description ? (
            <div className="mt-1 truncate text-sm text-slate-500">
              {role.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "w-32",
      render: (role) => {
        const isSystem = role.name
          .trim()
          .toLowerCase()
          .includes("system");

        return (
          <StatusBadge
            tone={isSystem ? "info" : "neutral"}
            dot
          >
            {isSystem ? "System" : "Custom"}
          </StatusBadge>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Roles"
        description="Manage roles and their assigned permissions."
      >
        {canCreate ? (
          <button
            type="button"
            onClick={() =>
              router.push(
                "/access-control/roles/create",
              )
            }
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create role
          </button>
        ) : null}
      </PageHeader>

      <div className="space-y-4">
        <FilterBar resetParams={["search"]}>
          <FilterSearch
            name="search"
            placeholder="Search roles..."
          />
        </FilterBar>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            rows={roles}
            getRowKey={(role) => role.id}
            onRowClick={(role) =>
              router.push(
                `/access-control/roles/${role.id}`,
              )
            }
          />
        </div>

        {roles.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              No roles found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No roles matched your current search.
            </p>
          </div>
        ) : null}

        {meta.totalPages > 1 ? (
          <Pagination meta={meta} />
        ) : null}
      </div>
    </PageContainer>
  );
}