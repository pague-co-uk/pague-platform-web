"use client";

import {
  useState,
} from "react";

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
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast";

import {
  deleteMobileNetworkPrefix,
  disableMobileNetworkPrefix,
  enableMobileNetworkPrefix,
  MobileNetworksApiError,
} from "@/features/mobile-networks/api/mobile-networks-api";

import type {
  FindMobileNetworkPrefixesResult,
  MobileNetworkPrefix,
} from "@/features/mobile-networks/api/mobile-networks-api";
import { formatDate } from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface MobileNetworkPrefixesClientProps {
  readonly mobileNetworkId: string;

  readonly mobileNetworkName: string;

  readonly initialPrefixes:
  | FindMobileNetworkPrefixesResult
  | null;

  readonly canCreatePrefixes: boolean;

  readonly canUpdatePrefixes: boolean;

  readonly canDeletePrefixes: boolean;

  readonly canEnablePrefixes: boolean;

  readonly canDisablePrefixes: boolean;
}

type PrefixAction =
  | "enable"
  | "disable"
  | "delete"
  | null;

// ============================================================================
// Mobile Network prefixes client
// ============================================================================

export default function MobileNetworkPrefixesClient({
  mobileNetworkId,
  mobileNetworkName,
  initialPrefixes,
  canCreatePrefixes,
  canUpdatePrefixes,
  canDeletePrefixes,
  canEnablePrefixes,
  canDisablePrefixes,
}: MobileNetworkPrefixesClientProps) {
  const router =
    useRouter();

  const toast =
    useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    actionPrefixId,
    setActionPrefixId,
  ] = useState<string | null>(
    null,
  );

  const [
    action,
    setAction,
  ] = useState<PrefixAction>(
    null,
  );

  const [
    deletePrefix,
    setDeletePrefix,
  ] = useState<MobileNetworkPrefix | null>(
    null,
  );

  // ==========================================================================
  // Actions
  // ==========================================================================

  async function handleEnable(
    prefix: MobileNetworkPrefix,
  ) {
    setActionPrefixId(
      prefix.id,
    );

    setAction("enable");

    try {
      await enableMobileNetworkPrefix(
        mobileNetworkId,
        prefix.id,
      );

      toast.success(
        "Prefix enabled",
        `Prefix "${prefix.prefix}" is now enabled.`,
      );

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to enable prefix.",
      );
    } finally {
      setActionPrefixId(null);
      setAction(null);
    }
  }

  async function handleDisable(
    prefix: MobileNetworkPrefix,
  ) {
    setActionPrefixId(
      prefix.id,
    );

    setAction("disable");

    try {
      await disableMobileNetworkPrefix(
        mobileNetworkId,
        prefix.id,
      );

      toast.success(
        "Prefix disabled",
        `Prefix "${prefix.prefix}" is now disabled.`,
      );

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to disable prefix.",
      );
    } finally {
      setActionPrefixId(null);
      setAction(null);
    }
  }

  function handleDeleteRequest(
    prefix: MobileNetworkPrefix,
  ) {
    setDeletePrefix(
      prefix,
    );
  }

  async function handleDeleteConfirm() {
    if (!deletePrefix) {
      return;
    }

    setActionPrefixId(
      deletePrefix.id,
    );

    setAction("delete");

    try {
      await deleteMobileNetworkPrefix(
        mobileNetworkId,
        deletePrefix.id,
      );

      toast.success(
        "Prefix deleted",
        `Prefix "${deletePrefix.prefix}" has been deleted.`,
      );

      setDeletePrefix(null);

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to delete prefix.",
      );
    } finally {
      setActionPrefixId(null);
      setAction(null);
    }
  }

  function handleDeleteCancel() {
    if (
      action === "delete"
    ) {
      return;
    }

    setDeletePrefix(null);
  }

  function handleActionError(
    error: unknown,
    fallback: string,
  ) {
    if (
      error instanceof
      MobileNetworksApiError
    ) {
      toast.error(
        "Action failed",
        error.message,
      );

      return;
    }

    toast.error(
      "Action failed",
      fallback,
    );
  }

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<MobileNetworkPrefix>[] =
    [
      {
        key: "prefix",

        header: "Prefix",

        render: (prefix) => (
          <code className="font-mono text-sm font-medium text-slate-900">
            {prefix.prefix}
          </code>
        ),
      },

      {
        key: "countryCode",

        header: "Country",

        render: (prefix) => (
          <span className="text-sm text-slate-600">
            {prefix.countryCode}
          </span>
        ),
      },

      {
        key: "enabled",

        header: "Status",

        render: (prefix) => (
          <StatusBadge
            tone={
              prefix.enabled
                ? "success"
                : "neutral"
            }
          >
            {prefix.enabled
              ? "Enabled"
              : "Disabled"}
          </StatusBadge>
        ),
      },

      {
        key: "createdAt",

        header: "Created",

        className:
          "hidden md:table-cell",

        render: (prefix) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              prefix.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "actions",

        header: "",

        className:
          "text-right",

        render: (prefix) => {
          const isActing =
            actionPrefixId ===
            prefix.id;

          return (
            <div
              className="flex items-center justify-end gap-2"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {/* ============================================================
                  Edit
              ============================================================= */}

              {canUpdatePrefixes && (
                <Link
                  href={`/mobile-networks/${encodeURIComponent(
                    mobileNetworkId,
                  )}/prefixes/${encodeURIComponent(
                    prefix.id,
                  )}/edit`}
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Edit
                </Link>
              )}

              {/* ============================================================
                  Enable / Disable
              ============================================================= */}

              {prefix.enabled ? (
                canDisablePrefixes ? (
                  <button
                    type="button"
                    disabled={
                      isActing
                    }
                    onClick={() =>
                      handleDisable(
                        prefix,
                      )
                    }
                    className="text-sm font-medium text-amber-600 transition hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isActing &&
                      action ===
                      "disable"
                      ? "Disabling..."
                      : "Disable"}
                  </button>
                ) : null
              ) : canEnablePrefixes ? (
                <button
                  type="button"
                  disabled={
                    isActing
                  }
                  onClick={() =>
                    handleEnable(
                      prefix,
                    )
                  }
                  className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActing &&
                    action ===
                    "enable"
                    ? "Enabling..."
                    : "Enable"}
                </button>
              ) : null}

              {/* ============================================================
                  Delete
              ============================================================= */}

              {canDeletePrefixes && (
                <button
                  type="button"
                  disabled={
                    isActing
                  }
                  onClick={() =>
                    handleDeleteRequest(
                      prefix,
                    )
                  }
                  className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          );
        },
      },
    ];

  // ==========================================================================
  // Load error
  // ==========================================================================

  if (!initialPrefixes) {
    return (
      <PageContainer>
        <PageHeader
          title="Prefixes"
          description={`Manage numbering prefixes for ${mobileNetworkName}.`}
        />

        <div className="mt-5 rounded-xl border border-slate-200 bg-white">
          <ErrorState
            title="Unable to load prefixes"
            description="We couldn't load the numbering prefixes."
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
    <>
      <PageContainer>
        <PageHeader
          title="Prefixes"
          description={`Manage numbering prefixes for ${mobileNetworkName}.`}
        >
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/mobile-networks/${encodeURIComponent(
                mobileNetworkId,
              )}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Back to network
            </Link>

            {canCreatePrefixes && (
              <Link
                href={`/mobile-networks/${encodeURIComponent(
                  mobileNetworkId,
                )}/prefixes/new`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700/90"
              >
                Add prefix
              </Link>
            )}
          </div>
        </PageHeader>

        {/* ==================================================================
            Table
        =================================================================== */}

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {initialPrefixes.items
            .length === 0 ? (
            <EmptyState
              title="No prefixes found"
              description="There are no numbering prefixes configured for this mobile network."
            >
              {canCreatePrefixes && (
                <Link
                  href={`/mobile-networks/${encodeURIComponent(
                    mobileNetworkId,
                  )}/prefixes/new`}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Add prefix
                </Link>
              )}
            </EmptyState>
          ) : (
            <DataTable
              columns={
                columns
              }
              rows={
                initialPrefixes.items
              }
              getRowKey={(
                prefix,
              ) =>
                prefix.id
              }
            />
          )}
        </div>

        {/* ==================================================================
            Pagination
        =================================================================== */}

        {initialPrefixes.meta
          .total > 0 && (
            <div className="mt-4">
              <Pagination
                meta={
                  initialPrefixes.meta
                }
              />
            </div>
          )}
      </PageContainer>

      {/* ======================================================================
          Delete confirmation
      ======================================================================= */}

      <ConfirmModal
        open={
          deletePrefix !== null
        }
        title="Delete prefix?"
        description={
          deletePrefix ? (
            <>
              Are you sure you want to delete{" "}
              <strong>
                {deletePrefix.prefix}
              </strong>
              ? This action cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Delete prefix"
        confirmingLabel="Deleting..."
        cancelLabel="Cancel"
        confirming={
          action === "delete"
        }
        destructive
        onConfirm={
          handleDeleteConfirm
        }
        onCancel={
          handleDeleteCancel
        }
      />
    </>
  );
}