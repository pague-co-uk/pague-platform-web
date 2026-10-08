"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  disableProviderService,
  enableProviderService,
} from "@/features/provider-services/api/provider-services-api";

import type {
  ProviderService,
} from "@/features/provider-services/types/provider-service.types";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useToast,
} from "@/components/ui/toast";


interface ProviderServiceDetailsClientProps {
  initialProviderService:
  | ProviderService
  | null;
  canUpdate: boolean;
  canEnable: boolean;
  canDisable: boolean;
}

export default function ProviderServiceDetailsClient({
  initialProviderService,
  canUpdate,
  canEnable,
  canDisable,
}: ProviderServiceDetailsClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    providerService,
    setProviderService,
  ] = useState(
    initialProviderService,
  );

  const [
    action,
    setAction,
  ] = useState<
    "enable" | "disable" | null
  >(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  if (!providerService) {
    return (
      <PageContainer>
        <ContextAwareBackLinks
          clientHref="/provider-services"
          clientLabel="Provider Services"
          showPlatformLink
        />

        <PageHeader
          title="Provider Service"
          description="The requested provider service could not be found."
        />
      </PageContainer>
    );
  }

  function requestEnable() {
    setAction("enable");
  }

  function requestDisable() {
    setAction("disable");
  }

  function closeConfirmModal() {
    if (actionLoading) {
      return;
    }

    setAction(null);
  }

  async function confirmAction() {
    if (!action) {
      return;
    }

    setActionLoading(true);

    try {
      const updated =
        action === "enable"
          ? await enableProviderService(
            providerService!.id,
          )
          : await disableProviderService(
            providerService!.id,
          );

      setProviderService(
        updated,
      );

      setAction(null);

      success(
        action === "enable"
          ? "Provider service enabled"
          : "Provider service disabled",
        `${updated.providerName} / ${updated.serviceName} was ${action === "enable"
          ? "enabled"
          : "disabled"
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
        clientLabel="Provider Services"
        showPlatformLink
      />

      <PageHeader
        title={`${providerService.providerName} / ${providerService.serviceName}`}
        description="View and manage the payment provider service configuration."
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <StatusBadge
            tone={
              providerService.active
                ? "success"
                : "neutral"
            }
            dot
          >
            {providerService.active
              ? "Active"
              : "Disabled"}
          </StatusBadge>

          <div className="flex items-center gap-2">
            {canUpdate && (
              <Link
                href={`/provider-services/${providerService.id}/edit`}
                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Edit
              </Link>
            )}

            {providerService.active
              ? canDisable && (
                <button
                  type="button"
                  onClick={
                    requestDisable
                  }
                  className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-destructive"
                >
                  Disable
                </button>
              )
              : canEnable && (
                <button
                  type="button"
                  onClick={
                    requestEnable
                  }
                  className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
                >
                  Enable
                </button>
              )}
          </div>
        </div>

        <section className="rounded-lg border p-6">
          <h2 className="text-base font-semibold">
            Provider
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Name
              </dt>

              <dd className="mt-1 font-medium">
                {providerService.providerName}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Code
              </dt>

              <dd className="mt-1 font-mono text-sm">
                {providerService.providerCode}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Status
              </dt>

              <dd className="mt-1">
                {providerService.providerStatus}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-base font-semibold">
            Service
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Name
              </dt>

              <dd className="mt-1 font-medium">
                {providerService.serviceName}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Code
              </dt>

              <dd className="mt-1 font-mono text-sm">
                {providerService.serviceCode}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Category
              </dt>

              <dd className="mt-1">
                {providerService.serviceCategory}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Status
              </dt>

              <dd className="mt-1">
                {providerService.serviceStatus}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-base font-semibold">
            Configuration
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                External Service Code
              </dt>

              <dd className="mt-1 font-mono text-sm">
                {providerService.externalServiceCode ??
                  "—"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Configuration
              </dt>

              <dd className="mt-1">
                {providerService.configuration
                  ? (
                    <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                      {JSON.stringify(
                        providerService.configuration,
                        null,
                        2,
                      )}
                    </pre>
                  )
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-base font-semibold">
            Record Information
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Created
              </dt>

              <dd className="mt-1 text-sm">
                {new Date(
                  providerService.createdAt,
                ).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Last Updated
              </dt>

              <dd className="mt-1 text-sm">
                {new Date(
                  providerService.updatedAt,
                ).toLocaleString()}
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
        description={`${providerService.providerName
          } / ${providerService.serviceName
          } will be ${action === "enable"
            ? "enabled"
            : "disabled"
          }.`}
        confirmLabel={
          action === "enable"
            ? "Enable"
            : "Disable"
        }
        confirmingLabel={
          action === "enable"
            ? "Enabling..."
            : "Disabling..."
        }
        confirming={
          actionLoading
        }
        destructive={
          action === "disable"
        }
        onConfirm={
          confirmAction
        }
        onCancel={
          closeConfirmModal
        }
      />
    </PageContainer>
  );
}