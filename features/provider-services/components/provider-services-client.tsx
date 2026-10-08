"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  disableProviderService,
  enableProviderService,
  findProviderServices,
} from "@/features/provider-services/api/provider-services-api";

import type {
  ProviderService,
  ProviderServiceListMeta,
} from "@/features/provider-services/types/provider-service.types";


import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FilterBar, FilterSearch, FilterSelect } from "@/components/ui/filter-bar";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { SortButton } from "@/components/ui/sort-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useToast,
} from "@/components/ui/toast";

interface ProviderServicesClientProps {
  initialProviderServices: ProviderService[];
  meta: ProviderServiceListMeta;
  canCreate: boolean;
  canUpdate: boolean;
  canEnable: boolean;
  canDisable: boolean;
}

export default function ProviderServicesClient({
  initialProviderServices,
  meta,
  canCreate,
  canUpdate,
  canEnable,
  canDisable,
}: ProviderServicesClientProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    providerServices,
    setProviderServices,
  ] = useState(
    initialProviderServices,
  );

  const [
    currentMeta,
    setCurrentMeta,
  ] = useState(meta);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(
    null,
  );

  const [
    pendingProviderService,
    setPendingProviderService,
  ] = useState<ProviderService | null>(
    null,
  );

  const [
    pendingAction,
    setPendingAction,
  ] = useState<
    "enable" | "disable" | null
  >(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const search =
    searchParams.get("search") ??
    "";

  const activeParam =
    searchParams.get("active");

  const providerCode =
    searchParams.get(
      "providerCode",
    ) ?? "";

  const serviceCode =
    searchParams.get(
      "serviceCode",
    ) ?? "";

  const active =
    activeParam === "true"
      ? true
      : activeParam === "false"
        ? false
        : undefined;

  function updateQuery(
    updates: Record<
      string,
      string | undefined
    >,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    for (const [
      key,
      value,
    ] of Object.entries(
      updates,
    )) {
      if (
        value === undefined ||
        value === ""
      ) {
        params.delete(key);
      } else {
        params.set(
          key,
          value,
        );
      }
    }

    params.delete("page");

    const query =
      params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  async function refresh() {
    setLoading(true);
    setLoadError(null);

    try {
      const result =
        await findProviderServices({
          page:
            currentMeta.page,
          pageSize:
            currentMeta.pageSize,
          search:
            search || undefined,
          active,
          providerCode:
            providerCode ||
            undefined,
          serviceCode:
            serviceCode ||
            undefined,
          sort:
            searchParams.get(
              "sort",
            ) || undefined,
        });

      setProviderServices(
        result.items,
      );

      setCurrentMeta(
        result.meta,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load provider services.";

      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleRowClick(
    providerService: ProviderService,
  ) {
    router.push(
      `/provider-services/${providerService.id}`,
    );
  }

  function requestEnable(
    providerService: ProviderService,
  ) {
    setPendingProviderService(
      providerService,
    );

    setPendingAction(
      "enable",
    );
  }

  function requestDisable(
    providerService: ProviderService,
  ) {
    setPendingProviderService(
      providerService,
    );

    setPendingAction(
      "disable",
    );
  }

  function closeConfirmModal() {
    if (actionLoading) {
      return;
    }

    setPendingProviderService(
      null,
    );

    setPendingAction(
      null,
    );
  }

  async function confirmAction() {
    if (
      !pendingProviderService ||
      !pendingAction
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        pendingAction ===
          "enable"
          ? await enableProviderService(
            pendingProviderService.id,
          )
          : await disableProviderService(
            pendingProviderService.id,
          );

      setProviderServices(
        (current) =>
          current.map(
            (item) =>
              item.id === updated.id
                ? updated
                : item,
          ),
      );

      setPendingProviderService(
        null,
      );

      setPendingAction(
        null,
      );

      success(
        pendingAction === "enable"
          ? "Provider service enabled"
          : "Provider service disabled",
        `${updated.providerName} / ${updated.serviceName} was ${pendingAction ===
          "enable"
          ? "enabled"
          : "disabled"
        } successfully.`,
      );
    } catch (error) {
      showError(
        pendingAction === "enable"
          ? "Unable to enable provider service"
          : "Unable to disable provider service",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: "provider",
      header: "Provider",
      render: (
        item: ProviderService,
      ) => (
        <div>
          <div className="font-medium">
            {item.providerName}
          </div>

          <div className="text-sm text-muted-foreground">
            {item.providerCode}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (
        item: ProviderService,
      ) => (
        <div>
          <div className="font-medium">
            {item.serviceName}
          </div>

          <div className="text-sm text-muted-foreground">
            {item.serviceCode}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (
        item: ProviderService,
      ) => item.serviceCategory,
    },
    {
      key: "externalServiceCode",
      header:
        "External Code",
      render: (
        item: ProviderService,
      ) =>
        item.externalServiceCode ??
        "—",
    },
    {
      key: "status",
      header: "Status",
      render: (
        item: ProviderService,
      ) => (
        <StatusBadge
          tone={
            item.active
              ? "success"
              : "neutral"
          }
          dot
        >
          {item.active
            ? "Active"
            : "Disabled"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (
        item: ProviderService,
      ) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {canUpdate && (
            <Link
              href={`/provider-services/${item.id}/edit`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Edit
            </Link>
          )}

          {item.active
            ? canDisable && (
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-700"
                onClick={() =>
                  requestDisable(
                    item,
                  )
                }
              >
                Disable
              </button>
            )
            : canEnable && (
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                onClick={() =>
                  requestEnable(
                    item,
                  )
                }
              >
                Enable
              </button>
            )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageContainer>
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Provider Services"
            description="Configure which payment services are available through each payment provider."
          />

          {canCreate && (
            <Link
              href="/provider-services/new"
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Provider Service
            </Link>
          )}
        </div>

        <FilterBar>
          <FilterSearch
            name="search"
            placeholder="Search provider services..."
            defaultValue={search}
          />

          <FilterSelect
            name="active"
            placeholder="All statuses"
            options={[
              {
                value: "true",
                label: "Active",
              },
              {
                value: "false",
                label: "Disabled",
              },
            ]}
          />

          <FilterSearch
            name="providerCode"
            placeholder="Provider code"
            defaultValue={
              providerCode
            }
          />

          <FilterSearch
            name="serviceCode"
            placeholder="Service code"
            defaultValue={
              serviceCode
            }
          />

          <SortButton
            field="providerCode"
            label="Provider"
          />

          <SortButton
            field="serviceCode"
            label="Service"
          />

          <SortButton
            field="createdAt"
            label="Created"
            defaultDirection="desc"
          />
        </FilterBar>

        {loadError ? (
          <ErrorState
            title="Unable to load provider services"
            description={
              loadError
            }
          >
            <button
              type="button"
              onClick={refresh}
              className="text-sm font-medium underline"
            >
              Try again
            </button>
          </ErrorState>
        ) : loading ? (
          <LoadingState rows={6} />
        ) : providerServices.length ===
          0 ? (
          <EmptyState
            title="No provider services found"
            description="There are no provider services matching the current filters."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={
                providerServices
              }
              getRowKey={(item: ProviderService) =>
                item.id
              }
              onRowClick={
                handleRowClick
              }
            />

            <Pagination
              meta={currentMeta}
            />
          </>
        )}
      </PageContainer>

      <ConfirmModal
        open={
          pendingProviderService !==
          null &&
          pendingAction !== null
        }
        title={
          pendingAction ===
            "enable"
            ? "Enable provider service?"
            : "Disable provider service?"
        }
        description={
          pendingProviderService
            ? `${pendingProviderService.providerName} / ${pendingProviderService.serviceName} will be ${pendingAction ===
              "enable"
              ? "enabled"
              : "disabled"
            }.`
            : undefined
        }
        confirmLabel={
          pendingAction ===
            "enable"
            ? "Enable"
            : "Disable"
        }
        confirmingLabel={
          pendingAction ===
            "enable"
            ? "Enabling..."
            : "Disabling..."
        }
        confirming={
          actionLoading
        }
        destructive={
          pendingAction ===
          "disable"
        }
        onConfirm={
          confirmAction
        }
        onCancel={
          closeConfirmModal
        }
      />
    </>
  );
}