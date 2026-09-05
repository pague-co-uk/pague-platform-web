"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  DataTable,
  DataTableColumn,
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

import type {
  AuditLog,
  AuditLogMeta,
} from "@/features/audit-logs/api/audit-logs-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

type AuditLogFilter =
  | "client"
  | "user"
  | "action"
  | "entity";

interface AuditLogFilterOption {
  readonly value: string;
  readonly label: string;
}

interface AuditLogsClientProps {
  readonly auditLogs: readonly AuditLog[];
  readonly pagination: AuditLogMeta;
  readonly clients: readonly AuditLogFilterOption[];
  readonly users: readonly AuditLogFilterOption[];
}

// ============================================================================
// Constants
// ============================================================================

const FILTER_OPTIONS: readonly AuditLogFilterOption[] = [
  {
    value: "client",
    label: "Client",
  },
  {
    value: "user",
    label: "User",
  },
  {
    value: "action",
    label: "Action",
  },
  {
    value: "entity",
    label: "Entity",
  },
];

// ============================================================================
// Shared styling
// ============================================================================

const INPUT_CLASS_NAME = [
  "h-10",
  "w-full",
  "rounded-md",
  "border",
  "border-slate-300",
  "bg-white",
  "px-3",
  "text-sm",
  "text-slate-900",
  "shadow-sm",
  "outline-none",
  "transition-colors",
  "placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-500",
  "focus:ring-2",
  "focus:ring-blue-100",
].join(" ");

const SELECT_CLASS_NAME = [
  "h-10",
  "w-full",
  "rounded-md",
  "border",
  "border-slate-300",
  "bg-white",
  "px-3",
  "text-sm",
  "text-slate-900",
  "shadow-sm",
  "outline-none",
  "transition-colors",
  "hover:border-slate-400",
  "focus:border-blue-500",
  "focus:ring-2",
  "focus:ring-blue-100",
].join(" ");

const PRIMARY_BUTTON_CLASS_NAME = [
  "inline-flex",
  "h-10",
  "items-center",
  "justify-center",
  "rounded-md",
  "bg-slate-900",
  "px-4",
  "text-sm",
  "font-medium",
  "text-white",
  "shadow-sm",
  "transition-colors",
  "hover:bg-slate-800",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-slate-300",
].join(" ");

const SECONDARY_BUTTON_CLASS_NAME = [
  "inline-flex",
  "h-10",
  "items-center",
  "justify-center",
  "rounded-md",
  "border",
  "border-slate-300",
  "bg-white",
  "px-4",
  "text-sm",
  "font-medium",
  "text-slate-700",
  "shadow-sm",
  "transition-colors",
  "hover:bg-slate-50",
  "hover:text-slate-900",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-slate-200",
].join(" ");

const LABEL_CLASS_NAME = [
  "mb-1.5",
  "block",
  "text-xs",
  "font-semibold",
  "text-slate-600",
].join(" ");

// ============================================================================
// Helpers
// ============================================================================

function isAuditLogFilter(
  value: string | null,
): value is AuditLogFilter {
  return (
    value === "client" ||
    value === "user" ||
    value === "action" ||
    value === "entity"
  );
}

// ============================================================================
// Component
// ============================================================================

export default function AuditLogsClient({
  auditLogs,
  pagination,
  clients,
  users,
}: AuditLogsClientProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  // ==========================================================================
  // Current URL state
  // ==========================================================================

  const filterParam = searchParams.get("filter");

  const filter: AuditLogFilter = isAuditLogFilter(
    filterParam,
  )
    ? filterParam
    : "client";

  const search = searchParams.get("search") ?? "";

  const clientId = searchParams.get("clientId") ?? "";

  const userId = searchParams.get("userId") ?? "";

  const action = searchParams.get("action") ?? "";

  const entityType =
    searchParams.get("entityType") ?? "";

  const entityId =
    searchParams.get("entityId") ?? "";

  // ==========================================================================
  // Local input state
  // ==========================================================================

  const [
    searchInput,
    setSearchInput,
  ] = useState(search);

  const [
    actionInput,
    setActionInput,
  ] = useState(action);

  const [
    entityTypeInput,
    setEntityTypeInput,
  ] = useState(entityType);

  const [
    entityIdInput,
    setEntityIdInput,
  ] = useState(entityId);

  // ==========================================================================
  // URL helpers
  // ==========================================================================

  const updateUrl = (
    updates: Record<string, string | null>,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      },
    );

    params.set("page", "1");

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  // ==========================================================================
  // Search
  // ==========================================================================

  const applySearch = () => {
    updateUrl({
      search:
        searchInput.trim() || null,
    });
  };

  const clearSearch = () => {
    setSearchInput("");

    updateUrl({
      search: null,
    });
  };

  // ==========================================================================
  // Reset filters
  // ==========================================================================

  const resetFilters = () => {
    setSearchInput("");
    setActionInput("");
    setEntityTypeInput("");
    setEntityIdInput("");

    const params = new URLSearchParams();

    params.set("filter", "client");
    params.set("page", "1");
    params.set(
      "pageSize",
      String(pagination.pageSize || 20),
    );

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  // ==========================================================================
  // Active filter description
  // ==========================================================================

  const activeFilterDescription = useMemo(() => {
    switch (filter) {
      case "client":
        return clientId
          ? "Showing activity for the selected client."
          : "Select a client to view its audit activity.";

      case "user":
        return userId
          ? "Showing activity generated by the selected user."
          : "Select a user to view their audit activity.";

      case "action":
        return action
          ? `Showing audit events for action "${action}".`
          : "Enter an action and press Enter to search.";

      case "entity":
        return entityType && entityId
          ? `Showing activity for ${entityType} ${entityId}.`
          : "Enter an entity type and entity ID.";

      default:
        return "";
    }
  }, [
    action,
    clientId,
    entityId,
    entityType,
    filter,
    userId,
  ]);

  // ==========================================================================
  // Empty state description
  // ==========================================================================

  const emptyStateDescription = useMemo(() => {
    if (search) {
      return `No audit events matched "${search}".`;
    }

    switch (filter) {
      case "client":
        return clientId
          ? "There are no audit events recorded for this client."
          : "Select a client to view its audit activity.";

      case "user":
        return userId
          ? "There are no audit events recorded for this user."
          : "Select a user to view their audit activity.";

      case "action":
        return action
          ? "There are no audit events recorded for this action."
          : "Enter an action to search for audit events.";

      case "entity":
        return entityType && entityId
          ? "There are no audit events recorded for this entity."
          : "Enter an entity type and entity ID.";

      default:
        return "No audit events were found.";
    }
  }, [
    action,
    clientId,
    entityId,
    entityType,
    filter,
    search,
    userId,
  ]);

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: "createdAt",

      header: "Date",

      render: (auditLog) => (
        <div className="whitespace-nowrap">
          <p className="text-sm font-medium text-slate-800">
            {formatDate(auditLog.createdAt)}
          </p>
        </div>
      ),
    },

    {
      key: "action",

      header: "Action",

      render: (auditLog) => (
        <div className="min-w-0">
          <StatusBadge
            tone="info"
            dot
          >
            {auditLog.action}
          </StatusBadge>
        </div>
      ),
    },

    {
      key: "entity",

      header: "Entity",

      render: (auditLog) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {auditLog.entityType}
          </p>

          <p className="mt-0.5 max-w-[220px] truncate font-mono text-[11px] text-slate-600">
            {auditLog.entityId}
          </p>
        </div>
      ),
    },

    {
      key: "userId",

      header: "User",

      render: (auditLog) =>
        auditLog.userId ? (
          <span className="font-mono text-xs font-medium text-slate-700">
            {auditLog.userId}
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-500">
            System
          </span>
        ),
    },

    {
      key: "clientId",

      header: "Client",

      render: (auditLog) =>
        auditLog.clientId ? (
          <span className="font-mono text-xs font-medium text-slate-700">
            {auditLog.clientId}
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            —
          </span>
        ),
    },
  ];

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* Header */}

      <PageHeader
        title="Audit Logs"
        description="Review administrative activity and changes recorded by the Control Plane."
      />

      {/* Information */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm leading-6 text-slate-700">
          Audit logs are immutable records of
          administrative activity. Select an entry to
          view the complete event details.
        </p>
      </div>

      {/* Search */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="audit-search"
            className="text-sm font-semibold text-slate-700"
          >
            Search audit logs
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="audit-search"
              type="search"
              value={searchInput}
              placeholder="Search action, entity, user, client, IP address or user agent..."
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              className={[
                INPUT_CLASS_NAME,
                "sm:flex-1",
              ].join(" ")}
            />

            <button
              type="button"
              onClick={applySearch}
              className={PRIMARY_BUTTON_CLASS_NAME}
            >
              Search
            </button>

            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                className={SECONDARY_BUTTON_CLASS_NAME}
              >
                Clear
              </button>
            ) : null}
          </div>

          <p className="text-xs text-slate-500">
            Search is performed server-side across the
            available audit log fields.
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto] lg:items-end">
          {/* Filter type */}

          <div>
            <label
              htmlFor="audit-filter"
              className={LABEL_CLASS_NAME}
            >
              Filter by
            </label>

            <select
              id="audit-filter"
              value={filter}
              onChange={(event) => {
                const nextFilter =
                  event.target.value as AuditLogFilter;

                setActionInput("");
                setEntityTypeInput("");
                setEntityIdInput("");

                updateUrl({
                  filter: nextFilter,
                  clientId: null,
                  userId: null,
                  action: null,
                  entityType: null,
                  entityId: null,
                });
              }}
              className={SELECT_CLASS_NAME}
            >
              {FILTER_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Client */}

          {filter === "client" ? (
            <div>
              <label
                htmlFor="audit-client"
                className={LABEL_CLASS_NAME}
              >
                Client
              </label>

              <select
                id="audit-client"
                value={clientId}
                onChange={(event) => {
                  updateUrl({
                    clientId:
                      event.target.value || null,
                  });
                }}
                className={SELECT_CLASS_NAME}
              >
                <option value="">
                  Select client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.value}
                    value={client.value}
                  >
                    {client.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* User */}

          {filter === "user" ? (
            <div>
              <label
                htmlFor="audit-user"
                className={LABEL_CLASS_NAME}
              >
                User
              </label>

              <select
                id="audit-user"
                value={userId}
                onChange={(event) => {
                  updateUrl({
                    userId:
                      event.target.value || null,
                  });
                }}
                className={SELECT_CLASS_NAME}
              >
                <option value="">
                  Select user
                </option>

                {users.map((user) => (
                  <option
                    key={user.value}
                    value={user.value}
                  >
                    {user.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Action */}

          {filter === "action" ? (
            <div>
              <label
                htmlFor="audit-action"
                className={LABEL_CLASS_NAME}
              >
                Action
              </label>

              <input
                id="audit-action"
                type="text"
                value={actionInput}
                placeholder="e.g. user.login"
                onChange={(event) =>
                  setActionInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    updateUrl({
                      action:
                        actionInput.trim() ||
                        null,
                    });
                  }
                }}
                className={[
                  INPUT_CLASS_NAME,
                  "font-mono",
                ].join(" ")}
              />
            </div>
          ) : null}

          {/* Entity */}

          {filter === "entity" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="audit-entity-type"
                  className={LABEL_CLASS_NAME}
                >
                  Entity type
                </label>

                <input
                  id="audit-entity-type"
                  type="text"
                  value={entityTypeInput}
                  placeholder="e.g. User"
                  onChange={(event) =>
                    setEntityTypeInput(
                      event.target.value,
                    )
                  }
                  className={INPUT_CLASS_NAME}
                />
              </div>

              <div>
                <label
                  htmlFor="audit-entity-id"
                  className={LABEL_CLASS_NAME}
                >
                  Entity ID
                </label>

                <input
                  id="audit-entity-id"
                  type="text"
                  value={entityIdInput}
                  placeholder="Enter entity ID"
                  onChange={(event) =>
                    setEntityIdInput(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();

                      updateUrl({
                        entityType:
                          entityTypeInput.trim() ||
                          null,

                        entityId:
                          entityIdInput.trim() ||
                          null,
                      });
                    }
                  }}
                  className={[
                    INPUT_CLASS_NAME,
                    "font-mono",
                  ].join(" ")}
                />
              </div>
            </div>
          ) : null}

          {/* Apply */}

          {(filter === "action" ||
            filter === "entity") ? (
            <button
              type="button"
              onClick={() => {
                if (filter === "action") {
                  updateUrl({
                    action:
                      actionInput.trim() ||
                      null,
                  });

                  return;
                }

                updateUrl({
                  entityType:
                    entityTypeInput.trim() ||
                    null,

                  entityId:
                    entityIdInput.trim() ||
                    null,
                });
              }}
              className={PRIMARY_BUTTON_CLASS_NAME}
            >
              Apply
            </button>
          ) : (
            <button
              type="button"
              onClick={resetFilters}
              className={SECONDARY_BUTTON_CLASS_NAME}
            >
              Reset
            </button>
          )}
        </div>

        {/* Reset for action/entity */}

        {(filter === "action" ||
          filter === "entity") ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : null}

        {/* Active filter description */}

        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-500">
            {activeFilterDescription}
          </p>
        </div>
      </div>

      {/* Active search indicator */}

      {search ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Searching for{" "}
            <span className="font-semibold text-slate-900">
              "{search}"
            </span>
          </p>

          <button
            type="button"
            onClick={clearSearch}
            className="shrink-0 text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : null}

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {auditLogs.length === 0 ? (
          <EmptyState
            title="No audit logs"
            description={emptyStateDescription}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={auditLogs}
            getRowKey={(auditLog) =>
              auditLog.id
            }
            onRowClick={(auditLog) =>
              router.push(
                `/audit/${encodeURIComponent(
                  auditLog.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* Pagination */}

      {pagination.total > 0 ? (
        <div className="mt-4">
          <Pagination
            meta={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              totalPages:
                pagination.totalPages,
            }}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}