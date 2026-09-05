"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

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
  useToast,
} from "@/components/ui/toast";

import {
  adjustFloat,
  topUpFloat,
  type AdjustFloatInput,
  type FloatLedgerEntry,
} from "@/features/float/api/float-api";

import type {
  FloatLedgerMeta,
} from "@/features/float/api/float-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface FloatClientProps {
  readonly client: Client;

  readonly balance: number;

  readonly ledger: readonly FloatLedgerEntry[];

  readonly pagination: FloatLedgerMeta;

  readonly canTopUpFloat: boolean;

  readonly canAdjustFloat: boolean;
}

type FloatAction =
  | "TOPUP"
  | "ADJUSTMENT"
  | null;

// ============================================================================
// Component
// ============================================================================

export default function FloatClient({
  client,
  balance,
  ledger,
  pagination,
  canTopUpFloat,
  canAdjustFloat,
}: FloatClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    action,
    setAction,
  ] = useState<FloatAction>(
    null,
  );

  const [
    credits,
    setCredits,
  ] = useState("");

  const [
    referenceId,
    setReferenceId,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const clientName =
    client.displayName ||
    client.companyName;

  // ==========================================================================
  // Reset form
  // ==========================================================================

  function resetForm() {
    if (submitting) {
      return;
    }

    setCredits("");
    setReferenceId("");
    setDescription("");
    setAction(null);
  }

  // ==========================================================================
  // Top up
  // ==========================================================================

  async function handleTopUp() {
    if (submitting) {
      return;
    }

    const parsedCredits =
      Number(
        credits,
      );

    if (
      !Number.isInteger(
        parsedCredits,
      ) ||
      parsedCredits <= 0
    ) {
      showError(
        "Invalid credits",
        "Enter a positive whole number of SMS credits.",
      );

      return;
    }

    setSubmitting(true);

    try {
      await topUpFloat(
        client.id,
        {
          credits:
            parsedCredits,

          ...(referenceId.trim()
            ? {
              referenceId:
                referenceId.trim(),
            }
            : {}),

          ...(description.trim()
            ? {
              description:
                description.trim(),
            }
            : {}),
        },
      );

      success(
        "Float topped up",
        `${formatCredits(
          parsedCredits,
        )} SMS credits were added successfully.`,
      );

      resetForm();

      router.refresh();
    } catch (error) {
      console.error(
        "[Float] Unable to top up float.",
        error,
      );

      showError(
        "Unable to top up float",
        error instanceof Error
          ? error.message
          : "Unable to top up float.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Adjustment
  // ==========================================================================

  async function handleAdjustment() {
    if (submitting) {
      return;
    }

    const parsedCredits =
      Number(
        credits,
      );

    if (
      !Number.isInteger(
        parsedCredits,
      ) ||
      parsedCredits === 0
    ) {
      showError(
        "Invalid adjustment",
        "Enter a non-zero whole number of credits. Use a negative value to deduct credits.",
      );

      return;
    }

    if (
      !description.trim()
    ) {
      showError(
        "Description required",
        "Provide a description explaining why the float is being adjusted.",
      );

      return;
    }

    const input:
      AdjustFloatInput = {
      credits:
        parsedCredits,

      ...(referenceId.trim()
        ? {
          referenceId:
            referenceId.trim(),
        }
        : {}),

      description:
        description.trim(),
    };

    setSubmitting(true);

    try {
      await adjustFloat(
        client.id,
        input,
      );

      success(
        "Float adjusted",
        `${formatSignedCredits(
          parsedCredits,
        )} SMS credits were applied successfully.`,
      );

      resetForm();

      router.refresh();
    } catch (error) {
      console.error(
        "[Float] Unable to adjust float.",
        error,
      );

      showError(
        "Unable to adjust float",
        error instanceof Error
          ? error.message
          : "Unable to adjust float.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns:
    DataTableColumn<FloatLedgerEntry>[] =
    [
      {
        key: "createdAt",
        header: "Date",
        render: (entry) => (
          <span className="text-sm text-slate-500">
            {formatDate(
              entry.createdAt,
            )}
          </span>
        ),
      },

      {
        key: "transactionType",
        header: "Type",
        render: (entry) => (
          <FloatTransactionBadge
            type={
              entry.transactionType
            }
          />
        ),
      },

      {
        key: "credits",
        header: "Credits",
        className:
          "text-right",
        render: (entry) => (
          <span
            className={
              entry.credits >= 0
                ? "font-medium text-slate-900"
                : "font-medium text-red-600"
            }
          >
            {formatSignedCredits(
              entry.credits,
            )}
          </span>
        ),
      },

      {
        key: "reference",
        header: "Reference",
        render: (entry) => (
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-slate-600">
              {entry.referenceId ??
                "—"}
            </p>

            {entry.referenceType && (
              <p className="mt-0.5 text-[11px] text-slate-400">
                {formatReferenceType(
                  entry.referenceType,
                )}
              </p>
            )}
          </div>
        ),
      },

      {
        key: "description",
        header: "Description",
        render: (entry) => (
          <span className="text-sm text-slate-500">
            {entry.description ??
              "—"}
          </span>
        ),
      },
    ];

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="Float"
        description={`Manage SMS credits and view the float ledger for ${clientName}.`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {canTopUpFloat && (
            <button
              type="button"
              onClick={() =>
                setAction(
                  (current) =>
                    current ===
                      "TOPUP"
                      ? null
                      : "TOPUP",
                )
              }
              disabled={
                submitting
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action ===
                "TOPUP"
                ? "Cancel top up"
                : "Top up credits"}
            </button>
          )}

          {canAdjustFloat && (
            <button
              type="button"
              onClick={() =>
                setAction(
                  (current) =>
                    current ===
                      "ADJUSTMENT"
                      ? null
                      : "ADJUSTMENT",
                )
              }
              disabled={
                submitting
              }
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action ===
                "ADJUSTMENT"
                ? "Cancel adjustment"
                : "Adjust credits"}
            </button>
          )}
        </div>
      </PageHeader>

      {/* ======================================================================
          Client context
      ======================================================================= */}

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Client
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/clients/${encodeURIComponent(
                client.id,
              )}`}
              className="truncate text-sm font-semibold text-slate-900 transition hover:text-blue-600"
            >
              {clientName}
            </Link>

            <span className="font-mono text-xs text-slate-400">
              {client.publicId}
            </span>
          </div>
        </div>

        <Link
          href={`/clients/${encodeURIComponent(
            client.id,
          )}`}
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to client
        </Link>
      </div>

      {/* ======================================================================
          Balance
      ======================================================================= */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Available SMS Credits
        </p>

        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {formatCredits(
            balance,
          )}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Credits currently available for sending SMS.
        </p>
      </div>

      {/* ======================================================================
          Action form
      ======================================================================= */}

      {action !== null && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-white px-5 py-5">
          {action ===
            "TOPUP" ? (
            <>
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Top up SMS credits
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add credits to this client's float. The transaction will be recorded in the ledger.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="float-credits"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Credits
                  </label>

                  <input
                    id="float-credits"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      credits
                    }
                    onChange={(
                      event,
                    ) =>
                      setCredits(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="e.g. 100000"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Number of SMS credits to add.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="float-reference"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Reference ID
                  </label>

                  <input
                    id="float-reference"
                    type="text"
                    value={
                      referenceId
                    }
                    onChange={(
                      event,
                    ) =>
                      setReferenceId(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Optional reference"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="float-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>

                  <input
                    id="float-description"
                    type="text"
                    value={
                      description
                    }
                    onChange={(
                      event,
                    ) =>
                      setDescription(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Optional description"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={
                    submitting
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleTopUp
                  }
                  disabled={
                    submitting
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Adding credits…"
                    : "Add credits"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Adjust SMS credits
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record a manual correction to this client's float. Use a positive value to add credits or a negative value to deduct credits.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="float-adjustment-credits"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Credit adjustment
                  </label>

                  <input
                    id="float-adjustment-credits"
                    type="number"
                    step="1"
                    value={
                      credits
                    }
                    onChange={(
                      event,
                    ) =>
                      setCredits(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="e.g. 5000 or -5000"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Positive adds credits. Negative deducts credits.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="float-adjustment-reference"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Reference ID
                  </label>

                  <input
                    id="float-adjustment-reference"
                    type="text"
                    value={
                      referenceId
                    }
                    onChange={(
                      event,
                    ) =>
                      setReferenceId(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Optional reference"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="float-adjustment-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="float-adjustment-description"
                    rows={3}
                    value={
                      description
                    }
                    onChange={(
                      event,
                    ) =>
                      setDescription(
                        event.target
                          .value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Explain why this adjustment is required."
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    A description is required for every manual adjustment.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={
                    submitting
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleAdjustment
                  }
                  disabled={
                    submitting
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Applying adjustment…"
                    : "Apply adjustment"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================================
          Ledger
      ======================================================================= */}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Transaction Ledger
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Complete history of SMS credit transactions for this client.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {ledger.length ===
          0 ? (
          <EmptyState
            title="No float transactions"
            description="There are no SMS credit transactions recorded for this client."
          >
            {canTopUpFloat && (
              <button
                type="button"
                onClick={() =>
                  setAction(
                    "TOPUP",
                  )
                }
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Top up credits
              </button>
            )}

            {canAdjustFloat && (
              <button
                type="button"
                onClick={() =>
                  setAction(
                    "ADJUSTMENT",
                  )
                }
                className="ml-2 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Adjust credits
              </button>
            )}
          </EmptyState>
        ) : (
          <DataTable
            columns={
              columns
            }
            rows={
              ledger
            }
            getRowKey={(entry) =>
              entry.id
            }
            onRowClick={(
              entry,
            ) =>
              router.push(
                `/clients/${encodeURIComponent(
                  client.id,
                )}/float/ledger/${encodeURIComponent(
                  entry.id,
                )}`,
              )
            }
          />
        )}
      </div>

      {/* ======================================================================
          Pagination
      ======================================================================= */}

      {pagination.total >
        0 && (
          <div className="mt-4">
            <Pagination
              meta={{
                page:
                  pagination.page,
                pageSize:
                  pagination.pageSize,
                total:
                  pagination.total,
                totalPages:
                  pagination.totalPages,
              }}
            />
          </div>
        )}
    </PageContainer>
  );
}

// ============================================================================
// Transaction badge
// ============================================================================

function FloatTransactionBadge({
  type,
}: {
  readonly type:
  FloatLedgerEntry["transactionType"];
}) {
  switch (type) {
    case "TOPUP":
      return (
        <StatusBadge
          tone="success"
          dot
        >
          Top Up
        </StatusBadge>
      );

    case "DEBIT":
      return (
        <StatusBadge
          tone="warning"
          dot
        >
          Debit
        </StatusBadge>
      );

    case "REFUND":
      return (
        <StatusBadge
          tone="info"
          dot
        >
          Refund
        </StatusBadge>
      );

    case "ADJUSTMENT":
      return (
        <StatusBadge
          tone="neutral"
          dot
        >
          Adjustment
        </StatusBadge>
      );
  }
}

// ============================================================================
// Formatting
// ============================================================================

function formatCredits(
  credits: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
  ).format(
    credits,
  );
}

function formatSignedCredits(
  credits: number,
): string {
  if (
    credits > 0
  ) {
    return `+${formatCredits(
      credits,
    )}`;
  }

  if (
    credits < 0
  ) {
    return `-${formatCredits(
      Math.abs(
        credits,
      ),
    )}`;
  }

  return "0";
}

function formatReferenceType(
  type: NonNullable<
    FloatLedgerEntry["referenceType"]
  >,
): string {
  switch (type) {
    case "MESSAGE":
      return "Message";

    case "ADMIN":
      return "Admin";

    case "SYSTEM":
      return "System";

    case "IMPORT":
      return "Import";

    default:
      return type;
  }
}