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
  disableTransactionType,
  enableTransactionType,
} from "@/features/transaction-types/api/transaction-types-api";

import type {
  TransactionType,
} from "@/features/transaction-types/types/transaction-type.types";

interface TransactionTypeDetailsClientProps {
  readonly initialTransactionType: TransactionType;

  readonly permissions: {
    canUpdate: boolean;
    canEnable: boolean;
    canDisable: boolean;
  };
}

type PendingAction =
  | "enable"
  | "disable"
  | null;

export default function TransactionTypeDetailsClient({
  initialTransactionType,
  permissions,
}: TransactionTypeDetailsClientProps) {
  const [
    transactionType,
    setTransactionType,
  ] = useState(
    initialTransactionType,
  );

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction>(null);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const {
    success,
    error: showError,
  } = useToast();

  const formatDate = (
    value: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(new Date(value));
  };

  async function handleConfirmAction() {
    if (
      !pendingAction ||
      processing
    ) {
      return;
    }

    setProcessing(true);

    try {
      const updated =
        pendingAction === "enable"
          ? await enableTransactionType(
            transactionType.id,
          )
          : await disableTransactionType(
            transactionType.id,
          );

      setTransactionType(updated);

      if (
        pendingAction === "enable"
      ) {
        success(
          "Transaction type enabled.",
          `${updated.name} is now active.`,
        );
      } else {
        success(
          "Transaction type disabled.",
          `${updated.name} has been disabled.`,
        );
      }

      setPendingAction(null);
    } catch (error) {
      showError(
        pendingAction === "enable"
          ? "Failed to enable transaction type."
          : "Failed to disable transaction type.",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setProcessing(false);
    }
  }

  const isActive =
    transactionType.active;

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref="/transaction-types"
          clientLabel="Transaction Types"
          showPlatformLink={false}
        />

        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title={transactionType.name}
            description={
              transactionType.code
            }
          />

          <div className="flex shrink-0 items-center gap-2">
            {permissions.canUpdate && (
              <Link
                href={`/transaction-types/${encodeURIComponent(
                  transactionType.id,
                )}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Edit
              </Link>
            )}

            {isActive
              ? permissions.canDisable && (
                <button
                  type="button"
                  onClick={() =>
                    setPendingAction(
                      "disable",
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  Disable
                </button>
              )
              : permissions.canEnable && (
                <button
                  type="button"
                  onClick={() =>
                    setPendingAction(
                      "enable",
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                >
                  Enable
                </button>
              )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-950">
                Transaction Type
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Transaction type details and
                current availability.
              </p>
            </div>

            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Code
                </dt>

                <dd className="mt-1">
                  <span className="font-mono text-sm font-medium text-slate-900">
                    {transactionType.code}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </dt>

                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {transactionType.name}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
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
                    {isActive
                      ? "ACTIVE"
                      : "DISABLED"}
                  </StatusBadge>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Description
                </dt>

                <dd className="mt-1 text-sm leading-6 text-slate-900">
                  {transactionType.description ||
                    "—"}
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
                Internal identifier for this
                transaction type.
              </p>
            </div>

            <dl className="space-y-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Transaction Type ID
                </dt>

                <dd className="mt-1 break-all font-mono text-xs leading-5 text-slate-700">
                  {transactionType.id}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Code
                </dt>

                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {transactionType.code}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-950">
                Description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Additional information about
                how this transaction type is
                used.
              </p>
            </div>

            {transactionType.description ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-6 text-slate-700">
                  {
                    transactionType.description
                  }
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No description
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This transaction type does
                  not currently have a
                  description.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-950">
                Record Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Lifecycle information for
                this transaction type record.
              </p>
            </div>

            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Created
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(
                    transactionType.createdAt,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last updated
                </dt>

                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(
                    transactionType.updatedAt,
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <ConfirmModal
          open={
            pendingAction !== null
          }
          title={
            pendingAction === "enable"
              ? "Enable transaction type?"
              : "Disable transaction type?"
          }
          description={
            pendingAction === "enable"
              ? `This will make ${transactionType.name} available for use on the payment platform.`
              : `This will prevent ${transactionType.name} from being used while retaining the transaction type in the catalogue.`
          }
          confirmLabel={
            pendingAction === "enable"
              ? "Enable"
              : "Disable"
          }
          confirmingLabel={
            pendingAction === "enable"
              ? "Enabling..."
              : "Disabling..."
          }
          confirming={processing}
          destructive={
            pendingAction ===
            "disable"
          }
          onConfirm={
            handleConfirmAction
          }
          onCancel={() => {
            if (!processing) {
              setPendingAction(null);
            }
          }}
        />
      </div>
    </PageContainer>
  );
}