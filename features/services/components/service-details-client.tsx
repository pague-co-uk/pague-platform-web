"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useToast,
} from "@/components/ui/toast";

import {
  disableService,
  enableService,
  ServicesApiError,
} from "@/features/services/api/services-api";

// ============================================================================
// Types
// ============================================================================

export interface ServiceDetails {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: "MESSAGING" | "PAYMENTS";
  status: "ACTIVE" | "DISABLED";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface ServiceDetailsClientProps {
  service: ServiceDetails;
  canUpdateServices: boolean;
  canEnableServices: boolean;
  canDisableServices: boolean;
}

type StatusAction =
  | "enable"
  | "disable";

// ============================================================================
// Helpers
// ============================================================================

function formatCategory(
  category: ServiceDetails["category"],
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

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  ).format(new Date(value));
}

// ============================================================================
// Component
// ============================================================================

export default function ServiceDetailsClient({
  service: initialService,
  canUpdateServices,
  canEnableServices,
  canDisableServices,
}: ServiceDetailsClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [service, setService] =
    useState<ServiceDetails>(
      initialService,
    );

  const [action, setAction] =
    useState<StatusAction | null>(
      null,
    );

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [confirming, setConfirming] =
    useState(false);

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const isActive =
    service.status === "ACTIVE";

  const isDisabled =
    service.status === "DISABLED";

  // ==========================================================================
  // Status actions
  // ==========================================================================

  function requestStatusChange(
    nextAction: StatusAction,
  ) {
    if (confirming) {
      return;
    }

    setAction(nextAction);
    setShowConfirm(true);
  }

  function cancelStatusChange() {
    if (confirming) {
      return;
    }

    setShowConfirm(false);
    setAction(null);
  }

  async function handleStatusChange() {
    if (!action || confirming) {
      return;
    }

    const requestedAction =
      action;

    setConfirming(true);

    try {
      const updated =
        requestedAction === "enable"
          ? await enableService(
            service.id,
          )
          : await disableService(
            service.id,
          );

      setService((current) => ({
        ...current,
        ...updated,
      }));

      success(
        requestedAction === "enable"
          ? "Service enabled successfully."
          : "Service disabled successfully.",
      );

      setShowConfirm(false);
      setAction(null);

      router.refresh();
    } catch (err) {
      if (
        err instanceof ServicesApiError
      ) {
        showError(err.message);
      } else if (
        err instanceof Error
      ) {
        showError(err.message);
      } else {
        showError(
          requestedAction === "enable"
            ? "Failed to enable service."
            : "Failed to disable service.",
        );
      }
    } finally {
      setConfirming(false);
    }
  }

  // ==========================================================================
  // Confirmation content
  // ==========================================================================

  const confirmationTitle =
    action === "enable"
      ? "Enable service?"
      : "Disable service?";

  const confirmationDescription =
    action === "enable"
      ? `Are you sure you want to enable ${service.name}?`
      : `Are you sure you want to disable ${service.name}?`;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <>
      <PageContainer>
        <div className="space-y-6">

          {/* ==================================================================
              Back navigation
          ================================================================== */}

          <ContextAwareBackLinks
            clientHref="/services"
            clientLabel="Back to services"
            showPlatformLink={false}
          />

          {/* ==================================================================
              Header
          ================================================================== */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {service.name}
                </h1>

                <StatusBadge
                  tone={
                    service.status ===
                      "ACTIVE"
                      ? "success"
                      : "neutral"
                  }
                  dot
                >
                  {service.status ===
                    "ACTIVE"
                    ? "Active"
                    : "Disabled"}
                </StatusBadge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono text-sm text-slate-500">
                  {service.code}
                </span>

                <span className="text-sm text-slate-400">
                  /
                </span>

                <span className="text-sm text-slate-500">
                  {formatCategory(
                    service.category,
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}

            <div className="flex shrink-0 flex-wrap gap-2">
              {canUpdateServices && (
                <Link
                  href={`/services/${service.id}/edit`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Edit
                </Link>
              )}

              {isActive &&
                canDisableServices && (
                  <button
                    type="button"
                    onClick={() =>
                      requestStatusChange(
                        "disable",
                      )
                    }
                    disabled={confirming}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Disable
                  </button>
                )}

              {isDisabled &&
                canEnableServices && (
                  <button
                    type="button"
                    onClick={() =>
                      requestStatusChange(
                        "enable",
                      )
                    }
                    disabled={confirming}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enable
                  </button>
                )}
            </div>
          </div>

          {/* ==================================================================
              Service details
          ================================================================== */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Service details
              </h2>
            </div>

            <dl className="divide-y divide-slate-100">

              {/* Code */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Code
                </dt>

                <dd className="font-mono text-sm text-slate-900 sm:col-span-2">
                  {service.code}
                </dd>
              </div>

              {/* Name */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Name
                </dt>

                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {service.name}
                </dd>
              </div>

              {/* Description */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Description
                </dt>

                <dd className="text-sm leading-6 text-slate-900 sm:col-span-2">
                  {service.description ||
                    "—"}
                </dd>
              </div>

              {/* Category */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Category
                </dt>

                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {formatCategory(
                    service.category,
                  )}
                </dd>
              </div>

              {/* Status */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Status
                </dt>

                <dd className="sm:col-span-2">
                  <StatusBadge
                    tone={
                      service.status ===
                        "ACTIVE"
                        ? "success"
                        : "neutral"
                    }
                    dot
                  >
                    {service.status ===
                      "ACTIVE"
                      ? "Active"
                      : "Disabled"}
                  </StatusBadge>
                </dd>
              </div>

            </dl>
          </section>

          {/* ==================================================================
              Metadata
          ================================================================== */}

          {service.metadata && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Metadata
                </h2>
              </div>

              <div className="p-6">
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">
                  {JSON.stringify(
                    service.metadata,
                    null,
                    2,
                  )}
                </pre>
              </div>
            </section>
          )}

          {/* ==================================================================
              Timestamps
          ================================================================== */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Timestamps
              </h2>
            </div>

            <dl className="divide-y divide-slate-100">

              {/* Created */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Created
                </dt>

                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {formatDateTime(
                    service.createdAt,
                  )}
                </dd>
              </div>

              {/* Updated */}

              <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">
                  Last updated
                </dt>

                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {formatDateTime(
                    service.updatedAt,
                  )}
                </dd>
              </div>

            </dl>
          </section>

        </div>
      </PageContainer>

      {/* ======================================================================
          Status confirmation
      ====================================================================== */}

      <ConfirmModal
        open={showConfirm}
        title={confirmationTitle}
        description={
          confirmationDescription
        }
        confirmLabel={
          action === "enable"
            ? "Enable"
            : "Disable"
        }
        confirmingLabel={
          action === "enable"
            ? "Enabling…"
            : "Disabling…"
        }
        cancelLabel="Cancel"
        destructive={
          action === "disable"
        }
        confirming={confirming}
        onCancel={
          cancelStatusChange
        }
        onConfirm={
          handleStatusChange
        }
      />
    </>
  );
}