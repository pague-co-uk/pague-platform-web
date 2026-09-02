"use client";

import {
  useCallback,
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
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  approveSenderId,
  deleteSenderId,
  disableSenderId,
  enableSenderId,
  rejectSenderId,
  setDefaultSenderId,
} from "../api/sender-ids-api";

import { formatDate } from "@/lib/date/format-date";
import type {
  SenderId,
  SenderIdStatus,
} from "../api/sender-ids-api";

interface SenderIdDetailsClientProps {
  senderId: SenderId;

  canUpdateSenderIds: boolean;

  canDeleteSenderIds: boolean;

  canApproveSenderIds: boolean;

  canRejectSenderIds: boolean;

  canDisableSenderIds: boolean;

  canEnableSenderIds: boolean;

  canDefaultUpdateSenderIds: boolean;
}

type SenderIdAction =
  | "approve"
  | "reject"
  | "disable"
  | "enable"
  | "default"
  | "delete"
  | null;

export default function SenderIdDetailsClient({
  senderId,
  canUpdateSenderIds,
  canDeleteSenderIds,
  canApproveSenderIds,
  canRejectSenderIds,
  canDisableSenderIds,
  canEnableSenderIds,
  canDefaultUpdateSenderIds,
}: SenderIdDetailsClientProps) {
  const router = useRouter();

  const [
    action,
    setAction,
  ] = useState<SenderIdAction>(null);

  const [
    confirming,
    setConfirming,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const isBusy =
    action !== null;

  const closeModal =
    useCallback(() => {
      if (confirming) {
        return;
      }

      setAction(null);
    }, [confirming]);

  async function executeAction() {
    if (!action) {
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      switch (action) {
        case "approve":
          await approveSenderId(
            senderId.id,
          );
          break;

        case "reject":
          await rejectSenderId(
            senderId.id,
          );
          break;

        case "disable":
          await disableSenderId(
            senderId.id,
          );
          break;

        case "enable":
          await enableSenderId(
            senderId.id,
          );
          break;

        case "default":
          await setDefaultSenderId(
            senderId.id,
          );
          break;

        case "delete":
          await deleteSenderId(
            senderId.id,
          );
          break;
      }

      setAction(null);

      if (action === "delete") {
        router.push(
          "/sender-ids",
        );
      } else {
        router.refresh();
      }
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          getActionErrorMessage(
            action,
          ),
        ),
      );
    } finally {
      setConfirming(false);
    }
  }

  function openAction(
    nextAction: Exclude<
      SenderIdAction,
      null
    >,
  ) {
    setError(null);
    setAction(nextAction);
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          title={senderId.sender}
          description="View Sender ID details and configuration."
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/sender-ids",
              )
            }
            disabled={isBusy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to Sender IDs
          </button>
        </PageHeader>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* ==================================================================
            Header summary
        ================================================================== */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  {senderId.sender}
                </h2>

                <StatusBadge
                  tone={getStatusTone(
                    senderId.status,
                  )}
                >
                  {formatStatus(
                    senderId.status,
                  )}
                </StatusBadge>

                {senderId.isDefault && (
                  <StatusBadge
                    tone="info"
                    dot={false}
                  >
                    Default
                  </StatusBadge>
                )}
              </div>

              <p className="mt-1 font-mono text-xs text-slate-500">
                {senderId.publicId}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canUpdateSenderIds && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/sender-ids/${encodeURIComponent(senderId.id)}/edit`,
                    )
                  }
                  disabled={isBusy}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>
              )}

              {canDeleteSenderIds && (
                <button
                  type="button"
                  onClick={() =>
                    openAction(
                      "delete",
                    )
                  }
                  disabled={isBusy}
                  className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================
            Details
        ================================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Sender ID
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Sender identification and client information.
              </p>
            </div>

            <dl className="mt-5 space-y-5">
              <DetailRow
                label="Sender"
                value={senderId.sender}
              />

              <DetailRow
                label="Public ID"
                value={
                  senderId.publicId
                }
                mono
              />

              <DetailRow
                label="Client"
                value={
                  senderId.client
                    .displayName
                }
              />

              {senderId.client
                .companyName !==
                senderId.client
                  .displayName && (
                  <DetailRow
                    label="Company"
                    value={
                      senderId.client
                        .companyName
                    }
                  />
                )}

              <DetailRow
                label="Client ID"
                value={
                  senderId.client.id
                }
                mono
              />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Status
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Current lifecycle state and timestamps.
              </p>
            </div>

            <dl className="mt-5 space-y-5">
              <div className="flex items-center justify-between gap-6">
                <dt className="text-sm text-slate-500">
                  Current status
                </dt>

                <dd>
                  <StatusBadge
                    tone={getStatusTone(
                      senderId.status,
                    )}
                  >
                    {formatStatus(
                      senderId.status,
                    )}
                  </StatusBadge>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-6">
                <dt className="text-sm text-slate-500">
                  Default Sender ID
                </dt>

                <dd>
                  {senderId.isDefault ? (
                    <StatusBadge
                      tone="info"
                      dot={false}
                    >
                      Default
                    </StatusBadge>
                  ) : (
                    <span className="text-sm text-slate-400">
                      No
                    </span>
                  )}
                </dd>
              </div>

              <DetailRow
                label="Created"
                value={formatDate(
                  senderId.createdAt,
                )}
              />

              <DetailRow
                label="Last updated"
                value={formatDate(
                  senderId.updatedAt,
                )}
              />
            </dl>
          </section>
        </div>

        {/* ==================================================================
            Lifecycle actions
        ================================================================== */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Available actions depend on the Sender ID status and your permissions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* ============================================================
                  Pending
              ============================================================ */}

              {senderId.status ===
                "PENDING" &&
                canApproveSenderIds && (
                  <button
                    type="button"
                    onClick={() =>
                      openAction(
                        "approve",
                      )
                    }
                    disabled={isBusy}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}

              {senderId.status ===
                "PENDING" &&
                canRejectSenderIds && (
                  <button
                    type="button"
                    onClick={() =>
                      openAction(
                        "reject",
                      )
                    }
                    disabled={isBusy}
                    className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}

              {/* ============================================================
                  Approved
              ============================================================ */}

              {senderId.status ===
                "APPROVED" &&
                canDisableSenderIds && (
                  <button
                    type="button"
                    onClick={() =>
                      openAction(
                        "disable",
                      )
                    }
                    disabled={isBusy}
                    className="rounded-md border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Disable
                  </button>
                )}

              {senderId.status ===
                "APPROVED" &&
                !senderId.isDefault &&
                canDefaultUpdateSenderIds && (
                  <button
                    type="button"
                    onClick={() =>
                      openAction(
                        "default",
                      )
                    }
                    disabled={isBusy}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Set as Default
                  </button>
                )}

              {/* ============================================================
                  Disabled
              ============================================================ */}

              {senderId.status ===
                "DISABLED" &&
                canEnableSenderIds && (
                  <button
                    type="button"
                    onClick={() =>
                      openAction(
                        "enable",
                      )
                    }
                    disabled={isBusy}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enable
                  </button>
                )}

              {/* ============================================================
                  No available lifecycle actions
              ============================================================ */}

              {!hasLifecycleActions({
                senderId,
                canApproveSenderIds,
                canRejectSenderIds,
                canDisableSenderIds,
                canEnableSenderIds,
                canDefaultUpdateSenderIds,
              }) && (
                  <span className="py-2 text-sm text-slate-400">
                    No lifecycle actions available.
                  </span>
                )}
            </div>
          </div>
        </section>
      </PageContainer>

      {/* ====================================================================
          Confirmation modal
      ==================================================================== */}

      <ConfirmModal
        open={action !== null}
        title={getActionTitle(
          action,
        )}
        description={getActionDescription(
          action,
          senderId,
        )}
        confirmLabel={getActionConfirmLabel(
          action,
        )}
        confirmingLabel={getActionConfirmingLabel(
          action,
        )}
        confirming={confirming}
        destructive={isDestructiveAction(
          action,
        )}
        onConfirm={
          executeAction
        }
        onCancel={closeModal}
      />
    </>
  );
}

// ============================================================================
// Detail row
// ============================================================================

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd
        className={
          mono
            ? "break-all font-mono text-xs text-slate-700"
            : "text-sm font-medium text-slate-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}

// ============================================================================
// Lifecycle actions
// ============================================================================

function hasLifecycleActions({
  senderId,
  canApproveSenderIds,
  canRejectSenderIds,
  canDisableSenderIds,
  canEnableSenderIds,
  canDefaultUpdateSenderIds,
}: {
  senderId: SenderId;

  canApproveSenderIds: boolean;

  canRejectSenderIds: boolean;

  canDisableSenderIds: boolean;

  canEnableSenderIds: boolean;

  canDefaultUpdateSenderIds: boolean;
}): boolean {
  if (
    senderId.status ===
    "PENDING"
  ) {
    return (
      canApproveSenderIds ||
      canRejectSenderIds
    );
  }

  if (
    senderId.status ===
    "APPROVED"
  ) {
    return (
      canDisableSenderIds ||
      (!senderId.isDefault &&
        canDefaultUpdateSenderIds)
    );
  }

  if (
    senderId.status ===
    "DISABLED"
  ) {
    return canEnableSenderIds;
  }

  return false;
}

// ============================================================================
// Confirmation modal content
// ============================================================================

function getActionTitle(
  action: SenderIdAction,
): string {
  switch (action) {
    case "approve":
      return "Approve Sender ID";

    case "reject":
      return "Reject Sender ID";

    case "disable":
      return "Disable Sender ID";

    case "enable":
      return "Enable Sender ID";

    case "default":
      return "Set Default Sender ID";

    case "delete":
      return "Delete Sender ID";

    default:
      return "";
  }
}

function getActionDescription(
  action: SenderIdAction,
  senderId: SenderId,
) {
  switch (action) {
    case "approve":
      return (
        <>
          Are you sure you want to approve{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>
          ? This Sender ID will become available for messaging.
        </>
      );

    case "reject":
      return (
        <>
          Are you sure you want to reject{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>
          ? The Sender ID will not be available for messaging.
        </>
      );

    case "disable":
      return (
        <>
          Are you sure you want to disable{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>
          ? It will no longer be available for messaging until it is enabled again.
        </>
      );

    case "enable":
      return (
        <>
          Are you sure you want to enable{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>
          ? This will make the Sender ID available for messaging again.
        </>
      );

    case "default":
      return (
        <>
          Set{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>{" "}
          as the default Sender ID for{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.client.displayName}
          </strong>
          ?
        </>
      );

    case "delete":
      return (
        <>
          Are you sure you want to delete{" "}
          <strong className="font-semibold text-slate-700">
            {senderId.sender}
          </strong>
          ? This action cannot be undone.
        </>
      );

    default:
      return null;
  }
}

function getActionConfirmLabel(
  action: SenderIdAction,
): string {
  switch (action) {
    case "approve":
      return "Approve";

    case "reject":
      return "Reject";

    case "disable":
      return "Disable";

    case "enable":
      return "Enable";

    case "default":
      return "Set as Default";

    case "delete":
      return "Delete";

    default:
      return "Confirm";
  }
}

function getActionConfirmingLabel(
  action: SenderIdAction,
): string {
  switch (action) {
    case "approve":
      return "Approving…";

    case "reject":
      return "Rejecting…";

    case "disable":
      return "Disabling…";

    case "enable":
      return "Enabling…";

    case "default":
      return "Setting…";

    case "delete":
      return "Deleting…";

    default:
      return "Confirming…";
  }
}

function isDestructiveAction(
  action: SenderIdAction,
): boolean {
  return (
    action === "delete" ||
    action === "reject" ||
    action === "disable"
  );
}

// ============================================================================
// Errors
// ============================================================================

function getActionErrorMessage(
  action: Exclude<
    SenderIdAction,
    null
  >,
): string {
  switch (action) {
    case "approve":
      return "Unable to approve Sender ID.";

    case "reject":
      return "Unable to reject Sender ID.";

    case "disable":
      return "Unable to disable Sender ID.";

    case "enable":
      return "Unable to enable Sender ID.";

    case "default":
      return "Unable to set Sender ID as default.";

    case "delete":
      return "Unable to delete Sender ID.";
  }
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

// ============================================================================
// Status
// ============================================================================

function getStatusTone(
  status: SenderIdStatus,
):
  | "success"
  | "warning"
  | "danger"
  | "neutral" {
  switch (status) {
    case "APPROVED":
      return "success";

    case "PENDING":
      return "warning";

    case "REJECTED":
      return "danger";

    case "DISABLED":
      return "neutral";
  }
}

function formatStatus(
  status: SenderIdStatus,
): string {
  switch (status) {
    case "APPROVED":
      return "Approved";

    case "PENDING":
      return "Pending";

    case "REJECTED":
      return "Rejected";

    case "DISABLED":
      return "Disabled";
  }
}
