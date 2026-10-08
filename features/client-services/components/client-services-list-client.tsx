"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { SortButton } from "@/components/ui/sort-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

import {
  disableClientService,
  enableClientService,
  findClientServices,
} from "@/features/client-services/api/client-services-api";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import type {
  ClientService,
  ClientServiceListResponse,
} from "@/features/client-services/types/client-service.types";
import { ClientServicesApiError } from "../api/client-services-server";

// ============================================================================
// Types
// ============================================================================

interface ClientServicesListClientProps {
  clientId: string;
  clientLabel: string;

  canCreate: boolean;
  canUpdate: boolean;
  canEnable: boolean;
  canDisable: boolean;
}

type StatusAction = "enable" | "disable";

// ============================================================================
// Component
// ============================================================================

export default function ClientServicesListClient({
  clientId,
  clientLabel,
  canCreate,
  canUpdate,
  canEnable,
  canDisable,
}: ClientServicesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [result, setResult] =
    useState<ClientServiceListResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionService, setActionService] =
    useState<ClientService | null>(null);

  const [action, setAction] =
    useState<StatusAction | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const page =
    Number(searchParams.get("page") ?? "1") || 1;

  const pageSize =
    Number(searchParams.get("pageSize") ?? "20") || 20;

  const search =
    searchParams.get("search") ?? "";

  const status =
    searchParams.get("status") ?? "";

  const sortBy =
    searchParams.get("sortBy");

  const sortDirection =
    searchParams.get("sortDirection");

  const sort = sortBy
    ? `${sortDirection === "desc" ? "-" : ""}${sortBy}`
    : "-createdAt";

  // ==========================================================================
  // Load
  // ==========================================================================

  const loadClientServices =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await findClientServices(
            clientId,
            {
              page,
              pageSize,
              search: search || undefined,
              status:
                status === "ACTIVE" ||
                  status === "DISABLED"
                  ? status
                  : undefined,
              sort,
            },
          );

        setResult(response);
      } catch (err) {
        const message =
          err instanceof ClientServicesApiError
            ? err.message
            : "We couldn't load this client's services.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [
      clientId,
      page,
      pageSize,
      search,
      status,
      sort,
    ]);

  useEffect(() => {
    void loadClientServices();
  }, [loadClientServices]);

  // ==========================================================================
  // Status actions
  // ==========================================================================

  function requestStatusChange(
    service: ClientService,
    nextAction: StatusAction,
  ) {
    if (actionLoading) {
      return;
    }

    setActionService(service);
    setAction(nextAction);
  }

  function closeAction() {
    if (actionLoading) {
      return;
    }

    setActionService(null);
    setAction(null);
  }

  async function handleAction() {
    if (
      !actionService ||
      !action ||
      actionLoading
    ) {
      return;
    }

    setActionLoading(true);

    try {
      if (action === "disable") {
        await disableClientService(
          clientId,
          actionService.serviceId,
        );

        success(
          "Service disabled",
          `${actionService.serviceName} has been disabled for this client.`,
        );
      } else {
        await enableClientService(
          clientId,
          actionService.serviceId,
        );

        success(
          "Service enabled",
          `${actionService.serviceName} has been enabled for this client.`,
        );
      }

      setActionService(null);
      setAction(null);

      await loadClientServices();

      router.refresh();
    } catch (err) {
      const message =
        err instanceof ClientServicesApiError
          ? err.message
          : `Failed to ${action} client service.`;

      showError(
        action === "disable"
          ? "Unable to disable service"
          : "Unable to enable service",
        message,
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================================
  // Table
  // ==========================================================================

  const services =
    result?.items ?? [];

  const pagination =
    result?.meta;

  const columns = [
    {
      key: "service",
      header: "Service",
      render: (
        service: ClientService,
      ) => (
        <div className="min-w-0">
          <Link
            href={`/clients/${clientId}/services/${service.serviceId}`}
            className="font-medium text-slate-900 hover:text-blue-600"
          >
            {service.serviceName}
          </Link>

          <p className="mt-0.5 font-mono text-xs text-slate-400">
            {service.serviceCode}
          </p>
        </div>
      ),
    },

    {
      key: "category",
      header: "Category",
      render: (
        service: ClientService,
      ) => (
        <span className="text-sm text-slate-600">
          {service.serviceCategory}
        </span>
      ),
    },

    {
      key: "serviceStatus",
      header: "Service Status",
      render: (
        service: ClientService,
      ) => (
        <StatusBadge
          tone={
            service.serviceStatus === "ACTIVE"
              ? "success"
              : "neutral"
          }
          dot
        >
          {service.serviceStatus}
        </StatusBadge>
      ),
    },

    {
      key: "status",
      header: (
        <SortButton
          field="status"
          label="Assignment Status"
        />
      ),
      render: (
        service: ClientService,
      ) => (
        <StatusBadge
          tone={
            service.status === "ACTIVE"
              ? "success"
              : "neutral"
          }
          dot
        >
          {service.status}
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
      render: (
        service: ClientService,
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-600">
          {formatDate(service.createdAt)}
        </span>
      ),
    },

    {
      key: "updatedAt",
      header: (
        <SortButton
          field="updatedAt"
          label="Updated"
        />
      ),
      render: (
        service: ClientService,
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-600">
          {formatDate(service.updatedAt)}
        </span>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      className: "w-px whitespace-nowrap",
      render: (
        service: ClientService,
      ) => {
        const assignmentActive =
          service.status === "ACTIVE";

        const assignmentDisabled =
          service.status === "DISABLED";

        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Link
              href={`/clients/${clientId}/services/${service.serviceId}`}
              className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              View
            </Link>

            {canUpdate && (
              <Link
                href={`/clients/${clientId}/services/${service.serviceId}/edit`}
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Edit
              </Link>
            )}

            {assignmentActive &&
              canDisable && (
                <button
                  type="button"
                  onClick={() =>
                    requestStatusChange(
                      service,
                      "disable",
                    )
                  }
                  disabled={actionLoading}
                  className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Disable
                </button>
              )}

            {assignmentDisabled &&
              canEnable && (
                <button
                  type="button"
                  onClick={() =>
                    requestStatusChange(
                      service,
                      "enable",
                    )
                  }
                  disabled={actionLoading}
                  className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Enable
                </button>
              )}
          </div>
        );
      },
    },
  ] satisfies readonly {
    key: string;
    header: React.ReactNode;
    render: (
      row: ClientService,
    ) => React.ReactNode;
    className?: string;
  }[];

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Client Services"
        description={`Services assigned to ${clientLabel}.`}
      >
        <ContextAwareBackLinks
          clientHref={`/clients/${clientId}`}
          clientLabel={clientLabel}
          showPlatformLink
          platformHref="/services"
          platformLabel="Services"
        />

        {canCreate && (
          <Link
            href={`/clients/${clientId}/services/new`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Assign Service
          </Link>
        )}
      </PageHeader>

      <div className="space-y-4">
        <FilterBar>
          <FilterSearch
            placeholder="Search services..."
          />

          <FilterSelect
            name="status"
            placeholder="All assignment statuses"
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

        {loading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ErrorState
              title="Unable to load client services"
              description={error}
            >
              <button
                type="button"
                onClick={() =>
                  void loadClientServices()
                }
                className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Try again
              </button>
            </ErrorState>
          </div>
        ) : services.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <EmptyState
              title="No services assigned"
              description={
                search || status
                  ? "No client services match the current filters."
                  : "This client does not have any services assigned yet."
              }
            >
              {canCreate &&
                !search &&
                !status && (
                  <Link
                    href={`/clients/${clientId}/services/new`}
                    className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Assign Service
                  </Link>
                )}
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={columns}
              rows={services}
              getRowKey={(
                service,
              ) => service.id}
            />

            {pagination && (
              <Pagination
                meta={pagination}
              />
            )}
          </div>
        )}
      </div>

      {/* ======================================================================
          Confirmation modal
      ====================================================================== */}

      <ConfirmModal
        open={
          actionService !== null &&
          action !== null
        }
        title={
          action === "disable"
            ? "Disable Client Service"
            : "Enable Client Service"
        }
        description={
          actionService
            ? action === "disable"
              ? `Are you sure you want to disable '${actionService.serviceName}' for this client?`
              : `Are you sure you want to enable '${actionService.serviceName}' for this client?`
            : ""
        }
        confirmLabel={
          action === "disable"
            ? "Disable"
            : "Enable"
        }
        confirmingLabel={
          action === "disable"
            ? "Disabling…"
            : "Enabling…"
        }
        confirming={actionLoading}
        destructive={
          action === "disable"
        }
        onConfirm={() =>
          void handleAction()
        }
        onCancel={closeAction}
      />
    </PageContainer>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}