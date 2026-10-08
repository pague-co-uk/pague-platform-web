"use client";

import Link from "next/link";
import { useState } from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

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
  ErrorState,
} from "@/components/ui/error-state";

import {
  useToast,
} from "@/components/ui/toast";

import {
  disableClientService,
  enableClientService,
} from "@/features/client-services/api/client-services-api";

import type {
  ClientService,
} from "@/features/client-services/types/client-service.types";

interface ClientServiceDetailsClientProps {
  readonly clientId: string;
  readonly initialClientService: ClientService | null;
  readonly canUpdate: boolean;
  readonly canEnable: boolean;
  readonly canDisable: boolean;
}

type StatusAction =
  | "enable"
  | "disable"
  | null;

export default function ClientServiceDetailsClient({
  clientId,
  initialClientService,
  canUpdate,
  canEnable,
  canDisable,
}: ClientServiceDetailsClientProps) {
  const {
    success,
    error: showError,
  } = useToast();

  const [
    clientService,
    setClientService,
  ] = useState<ClientService | null>(
    initialClientService,
  );

  const [
    action,
    setAction,
  ] = useState<StatusAction>(null);

  const [
    confirming,
    setConfirming,
  ] = useState(false);

  if (!clientService) {
    return (
      <PageContainer>
        <ContextAwareBackLinks
          clientHref={`/clients/${encodeURIComponent(
            clientId,
          )}/services`}
          clientLabel="Back to client services"
          showPlatformLink={false}
        />

        <ErrorState
          title="Unable to load client service"
          description="The client service could not be loaded. Please try again."
        />
      </PageContainer>
    );
  }

  const isActive =
    clientService.status === "ACTIVE";

  const isDisabled =
    clientService.status === "DISABLED";

  const formatDate = (
    value: string | null,
  ) => {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(new Date(value));
  };

  const requestStatusChange = (
    nextAction: Exclude<
      StatusAction,
      null
    >,
  ) => {
    setAction(nextAction);
  };

  const cancelStatusChange = () => {
    if (confirming) {
      return;
    }

    setAction(null);
  };

  const confirmStatusChange = async () => {
    if (!action || confirming) {
      return;
    }

    setConfirming(true);

    try {
      const updatedClientService =
        action === "enable"
          ? await enableClientService(
            clientId,
            clientService.serviceId,
          )
          : await disableClientService(
            clientId,
            clientService.serviceId,
          );

      setClientService(
        updatedClientService,
      );

      if (action === "enable") {
        success(
          "Client service enabled",
          `${clientService.serviceName} is now enabled for this client.`,
        );
      } else {
        success(
          "Client service disabled",
          `${clientService.serviceName} has been disabled for this client.`,
        );
      }

      setAction(null);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : action === "enable"
            ? "Failed to enable client service."
            : "Failed to disable client service.",
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <PageContainer>
      <ContextAwareBackLinks
        clientHref={`/clients/${clientId}`}
        clientLabel="Back to client"
        platformHref="/services"
        platformLabel="Services"
        showPlatformLink
      />

      <PageHeader
        title={clientService.serviceName}
        description="Service assignment details for this client."
      >
        {canUpdate && (
          <Link
            href={`/clients/${clientId}/services/${clientService.serviceId}/edit`}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Edit configuration
          </Link>
        )}

        {isActive && canDisable && (
          <button
            type="button"
            onClick={() =>
              requestStatusChange(
                "disable",
              )
            }
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
          >
            Disable
          </button>
        )}

        {isDisabled && canEnable && (
          <button
            type="button"
            onClick={() =>
              requestStatusChange(
                "enable",
              )
            }
            className="inline-flex items-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Enable
          </button>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-950">
              Assignment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Service assignment and current availability.
            </p>
          </div>

          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Service
              </dt>

              <dd className="mt-1">
                <Link
                  href={`/services/${clientService.serviceId}`}
                  className="font-medium text-slate-950 hover:underline"
                >
                  {clientService.serviceName}
                </Link>

                <div className="mt-1 font-mono text-xs text-slate-500">
                  {clientService.serviceCode}
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Category
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {clientService.serviceCategory}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assignment status
              </dt>

              <dd className="mt-2">
                <StatusBadge
                  tone={
                    isActive
                      ? "success"
                      : "neutral"
                  }
                  dot
                >
                  {clientService.status}
                </StatusBadge>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Service status
              </dt>

              <dd className="mt-2">
                <StatusBadge
                  tone={
                    clientService.serviceStatus ===
                      "ACTIVE"
                      ? "success"
                      : "neutral"
                  }
                  dot
                >
                  {clientService.serviceStatus}
                </StatusBadge>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Enabled at
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  clientService.enabledAt,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Disabled at
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  clientService.disabledAt,
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-950">
              Identifiers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Internal identifiers for this assignment.
            </p>
          </div>

          <dl className="space-y-5">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Assignment ID
              </dt>

              <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                {clientService.id}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Client ID
              </dt>

              <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                {clientService.clientId}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Service ID
              </dt>

              <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                {clientService.serviceId}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-950">
              Configuration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Service-specific configuration assigned to this client.
            </p>
          </div>

          {clientService.configuration ? (
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800">
              {JSON.stringify(
                clientService.configuration,
                null,
                2,
              )}
            </pre>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No configuration
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This service does not currently have client-specific configuration.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-950">
              Record information
            </h2>
          </div>

          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  clientService.createdAt,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Last updated
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  clientService.updatedAt,
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <ConfirmModal
        open={action !== null}
        title={
          action === "enable"
            ? "Enable client service?"
            : "Disable client service?"
        }
        description={
          action === "enable"
            ? `This will enable ${clientService.serviceName} for this client.`
            : `This will disable ${clientService.serviceName} for this client.`
        }
        confirmLabel={
          action === "enable"
            ? "Enable service"
            : "Disable service"
        }
        confirmingLabel={
          action === "enable"
            ? "Enabling..."
            : "Disabling..."
        }
        confirming={confirming}
        destructive={
          action === "disable"
        }
        onConfirm={
          confirmStatusChange
        }
        onCancel={
          cancelStatusChange
        }
      />
    </PageContainer>
  );
}