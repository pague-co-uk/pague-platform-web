"use client";

import Link from "next/link";
import { useState } from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast";

import {
  disableProviderService,
  enableProviderService,
} from "@/features/provider-services/api/provider-services-api";

import type {
  ProviderService,
} from "@/features/provider-services/types/provider-service.types";
import { formatDate } from "@/lib/date/format-date";

interface ProviderServiceDetailsClientProps {
  readonly initialProviderService: ProviderService | null;
  readonly canUpdate: boolean;
  readonly canEnable: boolean;
  readonly canDisable: boolean;
}

type LifecycleAction = "enable" | "disable" | null;

export default function ProviderServiceDetailsClient({
  initialProviderService,
  canUpdate,
  canEnable,
  canDisable,
}: ProviderServiceDetailsClientProps) {
  const {
    success,
    error: showError,
  } = useToast();

  const [providerService, setProviderService] = useState(
    initialProviderService,
  );

  const [action, setAction] = useState<LifecycleAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!providerService) {
    return (
      <PageContainer>
        <ContextAwareBackLinks
          clientHref="/provider-services"
          clientLabel="Provider Services"
          showPlatformLink
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Provider service not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The requested provider service could not be found.
          </p>
        </div>
      </PageContainer>
    );
  }

  const isActive = providerService.active;

  async function confirmAction() {
    if (!action || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        action === "enable"
          ? await enableProviderService(providerService!.id)
          : await disableProviderService(providerService!.id);

      setProviderService(updated);
      setAction(null);

      success(
        action === "enable"
          ? "Provider service enabled"
          : "Provider service disabled",
        `${updated.providerName} / ${updated.serviceName} was ${action === "enable" ? "enabled" : "disabled"
        } successfully.`,
      );
    } catch (error) {
      showError(
        action === "enable"
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

  return (
    <PageContainer>
      <ContextAwareBackLinks
        clientHref="/provider-services"
        clientLabel="Back to provider services"
        showPlatformLink
      />

      <div className="mt-6 space-y-6">
        {/* Heading, status and actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {providerService.providerName} / {providerService.serviceName}
              </h1>

              <StatusBadge
                tone={isActive ? "success" : "neutral"}
                dot
              >
                {isActive ? "Active" : "Disabled"}
              </StatusBadge>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              <span className="font-mono text-slate-600">
                {providerService.providerCode}
              </span>

              <span className="mx-3 text-slate-300">/</span>

              {providerService.serviceCategory}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canUpdate && (
              <Link
                href={`/provider-services/${encodeURIComponent(
                  providerService.id,
                )}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Edit
              </Link>
            )}

            {isActive && canDisable && (
              <button
                type="button"
                onClick={() => setAction("disable")}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
              >
                Disable
              </button>
            )}

            {!isActive && canEnable && (
              <button
                type="button"
                onClick={() => setAction("enable")}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Provider details */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Provider details
            </h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                {providerService.providerName}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Code</dt>
              <dd className="font-mono text-sm text-slate-900 sm:col-span-2">
                {providerService.providerCode}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">
                {providerService.providerStatus}
              </dd>
            </div>
          </dl>
        </section>

        {/* Service details */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Service details
            </h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                {providerService.serviceName}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Code</dt>
              <dd className="font-mono text-sm text-slate-900 sm:col-span-2">
                {providerService.serviceCode}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Category</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">
                {providerService.serviceCategory}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">
                {providerService.serviceStatus}
              </dd>
            </div>
          </dl>
        </section>

        {/* Configuration */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Configuration
            </h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                External service code
              </dt>
              <dd className="font-mono text-sm text-slate-900 sm:col-span-2">
                {providerService.externalServiceCode || "—"}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Configuration
              </dt>
              <dd className="min-w-0 sm:col-span-2">
                {providerService.configuration &&
                  Object.keys(providerService.configuration).length > 0 ? (
                  <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                    {JSON.stringify(
                      providerService.configuration,
                      null,
                      2,
                    )}
                  </pre>
                ) : (
                  <span className="text-sm text-slate-900">—</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Timestamps */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Timestamps
            </h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Created</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">
                {formatDate(new Date(providerService.createdAt))}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">Last updated</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">
                {formatDate(new Date(providerService.updatedAt))}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <ConfirmModal
        open={action !== null}
        title={
          action === "enable"
            ? "Enable provider service?"
            : "Disable provider service?"
        }
        description={`${providerService.providerName} / ${providerService.serviceName
          } will be ${action === "enable" ? "enabled" : "disabled"
          }.`}
        confirmLabel={action === "enable" ? "Enable" : "Disable"}
        confirmingLabel={
          action === "enable" ? "Enabling..." : "Disabling..."
        }
        confirming={actionLoading}
        destructive={action === "disable"}
        onConfirm={confirmAction}
        onCancel={() => {
          if (!actionLoading) {
            setAction(null);
          }
        }}
      />
    </PageContainer>
  );
}
