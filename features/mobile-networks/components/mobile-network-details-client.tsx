"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  deleteMobileNetwork,
  disableMobileNetwork,
  enableMobileNetwork,
  MobileNetworksApiError,
} from "@/features/mobile-networks/api/mobile-networks-api";

import type {
  MobileNetwork,
} from "@/features/mobile-networks/api/mobile-networks-api";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast";

// ============================================================================
// Types
// ============================================================================

interface MobileNetworkDetailsClientProps {
  readonly initialMobileNetwork:
  MobileNetwork;

  readonly canUpdateMobileNetwork: boolean;

  readonly canDeleteMobileNetwork: boolean;

  readonly canEnableMobileNetwork: boolean;

  readonly canDisableMobileNetwork: boolean;
}

type MobileNetworkAction =
  | "enable"
  | "disable"
  | "delete"
  | null;

// ============================================================================
// Mobile Network details client
// ============================================================================

export default function MobileNetworkDetailsClient({
  initialMobileNetwork,
  canUpdateMobileNetwork,
  canDeleteMobileNetwork,
  canEnableMobileNetwork,
  canDisableMobileNetwork,
}: MobileNetworkDetailsClientProps) {
  const router =
    useRouter();

  const toast =
    useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    mobileNetwork,
    setMobileNetwork,
  ] = useState(
    initialMobileNetwork,
  );

  const [
    action,
    setAction,
  ] = useState<MobileNetworkAction>(
    null,
  );

  const [
    deleteConfirmationOpen,
    setDeleteConfirmationOpen,
  ] = useState(false);

  // ==========================================================================
  // Actions
  // ==========================================================================

  async function handleEnable() {
    setAction("enable");

    try {
      const updated =
        await enableMobileNetwork(
          mobileNetwork.id,
        );

      setMobileNetwork(
        updated,
      );

      toast.success(
        "Mobile network enabled",
        `${mobileNetwork.name} is now active.`,
      );

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to enable mobile network.",
      );
    } finally {
      setAction(null);
    }
  }

  async function handleDisable() {
    setAction("disable");

    try {
      const updated =
        await disableMobileNetwork(
          mobileNetwork.id,
        );

      setMobileNetwork(
        updated,
      );

      toast.success(
        "Mobile network disabled",
        `${mobileNetwork.name} has been disabled.`,
      );

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to disable mobile network.",
      );
    } finally {
      setAction(null);
    }
  }

  function handleDeleteRequest() {
    setDeleteConfirmationOpen(
      true,
    );
  }

  function handleDeleteCancel() {
    if (
      action === "delete"
    ) {
      return;
    }

    setDeleteConfirmationOpen(
      false,
    );
  }

  async function handleDeleteConfirm() {
    setAction("delete");

    try {
      await deleteMobileNetwork(
        mobileNetwork.id,
      );

      toast.success(
        "Mobile network deleted",
        `${mobileNetwork.name} has been deleted.`,
      );

      setDeleteConfirmationOpen(
        false,
      );

      router.push(
        "/mobile-networks",
      );

      router.refresh();
    } catch (error) {
      handleActionError(
        error,
        "Unable to delete mobile network.",
      );
    } finally {
      setAction(null);
    }
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
  // Render
  // ==========================================================================

  return (
    <>
      <PageContainer>
        <PageHeader
          title={
            mobileNetwork.name
          }
          description={`Mobile network ${mobileNetwork.code}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/mobile-networks"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Back
            </Link>

            {canUpdateMobileNetwork && (
              <Link
                href={`/mobile-networks/${encodeURIComponent(
                  mobileNetwork.id,
                )}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Edit
              </Link>
            )}
          </div>
        </PageHeader>

        {/* ====================================================================
            Network information
        ===================================================================== */}

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Network
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {mobileNetwork.name}
            </p>

            <p className="mt-1 font-mono text-sm text-slate-500">
              {mobileNetwork.code}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Public ID
            </p>

            <code className="mt-2 block font-mono text-sm text-slate-900">
              {mobileNetwork.publicId}
            </code>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Country
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {mobileNetwork.country.name}
            </p>

            <p className="mt-1 font-mono text-sm text-slate-500">
              {mobileNetwork.country.code}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Routing Regex
            </p>

            {mobileNetwork.routingRegex ? (
              <code className="mt-2 block break-all font-mono text-sm text-slate-900">
                {mobileNetwork.routingRegex}
              </code>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Not configured
              </p>
            )}
          </div>
        </div>

        {/* ====================================================================
            Status and lifecycle
        ===================================================================== */}

        <div className="mt-4 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the operational state of this
              mobile network.
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <MobileNetworkStatusBadge
              status={
                mobileNetwork.status
              }
            />

            <div className="flex flex-wrap gap-2">
              {mobileNetwork.status ===
                "ACTIVE" &&
                canDisableMobileNetwork && (
                  <button
                    type="button"
                    onClick={
                      handleDisable
                    }
                    disabled={
                      action !== null
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {action ===
                      "disable"
                      ? "Disabling..."
                      : "Disable"}
                  </button>
                )}

              {mobileNetwork.status ===
                "DISABLED" &&
                canEnableMobileNetwork && (
                  <button
                    type="button"
                    onClick={
                      handleEnable
                    }
                    disabled={
                      action !== null
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {action ===
                      "enable"
                      ? "Enabling..."
                      : "Enable"}
                  </button>
                )}

              {canDeleteMobileNetwork && (
                <button
                  type="button"
                  onClick={
                    handleDeleteRequest
                  }
                  disabled={
                    action !== null
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* ======================================================================
          Delete confirmation
      ======================================================================= */}

      <ConfirmModal
        open={
          deleteConfirmationOpen
        }
        title="Delete mobile network?"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>
              {mobileNetwork.name}
            </strong>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete mobile network"
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
  if (status === "ACTIVE") {
    return (
      <StatusBadge
        tone="success"
      >
        Active
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      tone="danger"
    >
      Disabled
    </StatusBadge>
  );
}