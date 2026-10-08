"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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
  useToast,
} from "@/components/ui/toast";

import {
  disablePaymentProvider,
  enablePaymentProvider,
} from "@/features/payment-providers/api/payment-providers-api";

import type {
  PaymentProvider,
} from "../types/payment-provider.types";

interface PaymentProviderDetailsClientProps {
  readonly initialProvider:
  | PaymentProvider
  | null;
  readonly canUpdate: boolean;
  readonly canEnable: boolean;
  readonly canDisable: boolean;
}

type LifecycleAction =
  | "enable"
  | "disable"
  | null;

export default function PaymentProviderDetailsClient({
  initialProvider,
  canUpdate,
  canEnable,
  canDisable,
}: PaymentProviderDetailsClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    provider,
    setProvider,
  ] = useState(
    initialProvider,
  );

  const [
    action,
    setAction,
  ] = useState<LifecycleAction>(
    null,
  );

  const [
    confirming,
    setConfirming,
  ] = useState(false);

  if (!provider) {
    return (
      <PageContainer>
        <ContextAwareBackLinks
          clientHref="/payment-providers"
          clientLabel="Back to payment providers"
          showPlatformLink={false}
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Payment provider not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The requested payment provider
            could not be found.
          </p>
        </div>
      </PageContainer>
    );
  }

  const isActive =
    provider.status === "ACTIVE";

  async function handleLifecycleAction() {
    if (!provider || !action) {
      return;
    }

    setConfirming(true);

    try {
      const updatedProvider =
        action === "enable"
          ? await enablePaymentProvider(
            provider.id,
          )
          : await disablePaymentProvider(
            provider.id,
          );

      setProvider(
        updatedProvider,
      );

      success(
        action === "enable"
          ? "Provider enabled"
          : "Provider disabled",
        action === "enable"
          ? `${updatedProvider.name} is now active.`
          : `${updatedProvider.name} has been disabled.`,
      );

      setAction(null);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : action === "enable"
            ? "Failed to enable provider."
            : "Failed to disable provider.",
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <PageContainer>
      <ContextAwareBackLinks
        clientHref="/payment-providers"
        clientLabel="Back to payment providers"
        showPlatformLink={false}
      />

      <PageHeader
        title={provider.name}
        description="Payment provider configuration and status."
      >
        <div className="flex flex-wrap gap-2">
          {canUpdate && (
            <Link
              href={`/payment-providers/${encodeURIComponent(
                provider.id,
              )}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </Link>
          )}

          {!isActive &&
            canEnable && (
              <button
                type="button"
                onClick={() =>
                  setAction("enable")
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Enable
              </button>
            )}

          {isActive &&
            canDisable && (
              <button
                type="button"
                onClick={() =>
                  setAction("disable")
                }
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Disable
              </button>
            )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Provider details
            </h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Name
              </dt>

              <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                {provider.name}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Code
              </dt>

              <dd className="font-mono text-sm text-slate-900 sm:col-span-2">
                {provider.code}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Status
              </dt>

              <dd className="sm:col-span-2">
                <StatusBadge
                  tone={
                    provider.status ===
                      "ACTIVE"
                      ? "success"
                      : "neutral"
                  }
                >
                  {provider.status}
                </StatusBadge>
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Description
              </dt>

              <dd className="text-sm leading-6 text-slate-700 sm:col-span-2">
                {provider.description ||
                  "—"}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Created
              </dt>

              <dd className="text-sm text-slate-700 sm:col-span-2">
                {new Date(
                  provider.createdAt,
                ).toLocaleString()}
              </dd>
            </div>

            <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm text-slate-500">
                Updated
              </dt>

              <dd className="text-sm text-slate-700 sm:col-span-2">
                {new Date(
                  provider.updatedAt,
                ).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Metadata
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Additional provider metadata.
            </p>
          </div>

          <div className="p-6">
            {provider.metadata ? (
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                {JSON.stringify(
                  provider.metadata,
                  null,
                  2,
                )}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">
                No metadata configured.
              </p>
            )}
          </div>
        </section>
      </div>

      <ConfirmModal
        open={action !== null}
        title={
          action === "enable"
            ? "Enable payment provider?"
            : "Disable payment provider?"
        }
        description={
          action === "enable"
            ? `This will make ${provider.name} active and available for use.`
            : `This will disable ${provider.name}. Existing configuration will be retained.`
        }
        confirmLabel={
          action === "enable"
            ? "Enable Provider"
            : "Disable Provider"
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
          handleLifecycleAction
        }
        onCancel={() =>
          setAction(null)
        }
      />
    </PageContainer>
  );
}