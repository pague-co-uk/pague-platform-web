"use client";

import {
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ConnectorsApiError,
  deleteConnector,
  disableConnector,
  enableConnector,
  suspendConnector,
  type Connector,
} from "@/features/connectors/api/connectors-api";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast";

interface ConnectorDetailsClientProps {
  connector: Connector;
  canUpdate: boolean;
  canDelete: boolean;
  canEnable: boolean;
  canDisable: boolean;
  canSuspend: boolean;
}

type ConnectorAction =
  | "enable"
  | "disable"
  | "suspend"
  | "delete"
  | null;

const SENSITIVE_CONFIG_KEYS =
  new Set([
    "password",
    "passwd",
    "pass",
    "secret",
    "token",
    "apikey",
    "api_key",
    "accesskey",
    "access_key",
    "secretkey",
    "secret_key",
    "clientsecret",
    "client_secret",
    "credential",
    "credentials",
    "authorization",
    "username",
    "user",
  ]);

function isSensitiveConfigKey(
  key: string,
): boolean {
  const normalizedKey =
    key
      .replace(/[-_\s]/g, "")
      .toLowerCase();

  return SENSITIVE_CONFIG_KEYS.has(
    normalizedKey,
  );
}

function maskConfiguration(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map(
      maskConfiguration,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, childValue]) => [
          key,
          isSensitiveConfigKey(key)
            ? "****"
            : maskConfiguration(
              childValue,
            ),
        ],
      ),
    );
  }

  return value;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(value),
  );
}

function getStatusLabel(
  status: Connector["status"],
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "DISABLED":
      return "Disabled";

    case "SUSPENDED":
      return "Suspended";

    default:
      return status;
  }
}

function getStatusClasses(
  status: Connector["status"],
): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 ring-green-600/20";

    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "DISABLED":
      return "bg-red-50 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-50 text-slate-700 ring-slate-600/20";
  }
}

export default function ConnectorDetailsClient({
  connector: initialConnector,
  canUpdate,
  canDelete,
  canEnable,
  canDisable,
  canSuspend,
}: ConnectorDetailsClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [connector, setConnector] =
    useState(initialConnector);

  const [action, setAction] =
    useState<ConnectorAction>(null);

  const [confirmationOpen, setConfirmationOpen] =
    useState(false);

  const [pendingAction, setPendingAction] =
    useState<
      Exclude<
        ConnectorAction,
        null
      > | null
    >(null);

  function requestAction(
    nextAction: Exclude<
      ConnectorAction,
      null
    >,
  ) {
    setPendingAction(
      nextAction,
    );

    setConfirmationOpen(
      true,
    );
  }

  function handleCancel() {
    if (action) {
      return;
    }

    setConfirmationOpen(false);
    setPendingAction(null);
  }

  async function handleConfirm() {
    if (!pendingAction) {
      return;
    }

    setAction(
      pendingAction,
    );

    try {
      let updatedConnector: Connector;

      switch (pendingAction) {
        case "enable":
          updatedConnector =
            await enableConnector(
              connector.id,
            );
          break;

        case "disable":
          updatedConnector =
            await disableConnector(
              connector.id,
            );
          break;

        case "suspend":
          updatedConnector =
            await suspendConnector(
              connector.id,
            );
          break;

        case "delete":
          await deleteConnector(
            connector.id,
          );

          success(
            "Connector deleted",
            `${connector.name} was deleted successfully.`,
          );

          setConfirmationOpen(
            false,
          );

          setPendingAction(
            null,
          );

          router.push(
            "/connectors",
          );

          router.refresh();

          return;
      }

      setConnector(
        updatedConnector,
      );

      const actionLabels: Record<
        Exclude<
          ConnectorAction,
          null
        >,
        string
      > = {
        enable: "enabled",
        disable: "disabled",
        suspend: "suspended",
        delete: "deleted",
      };

      success(
        `Connector ${actionLabels[pendingAction]}`,
        `${connector.name} was ${actionLabels[pendingAction]} successfully.`,
      );

      setConfirmationOpen(
        false,
      );

      setPendingAction(
        null,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof
          ConnectorsApiError
          ? err.message
          : `Unable to ${pendingAction} connector.`;

      showError(
        "Action failed",
        message,
      );
    } finally {
      setAction(null);
    }
  }

  const isBusy =
    action !== null;

  const configuration =
    connector.configuration;

  const displayConfiguration =
    maskConfiguration(
      configuration,
    );

  return (
    <main className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <Link
          href="/connectors"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to connectors
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {connector.name}
            </h1>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
                connector.status,
              )}`}
            >
              {getStatusLabel(
                connector.status,
              )}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Connector details and configuration.
          </p>
        </div>

        {canUpdate && (
          <Link
            href={`/connectors/${connector.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit connector
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Connector information
            </h2>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Public ID
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {connector.publicId}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Code
              </dt>

              <dd className="mt-1 font-mono text-sm text-slate-900">
                {connector.code}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Provider
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {connector.provider}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Transport
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {connector.transport}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  connector.createdAt,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Updated
              </dt>

              <dd className="mt-1 text-sm text-slate-900">
                {formatDate(
                  connector.updatedAt,
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Configuration
            </h2>
          </div>

          <div className="p-6">
            {configuration &&
              Object.keys(
                configuration,
              ).length > 0 ? (
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
                {JSON.stringify(
                  displayConfiguration,
                  null,
                  2,
                )}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">
                No configuration has been provided.
              </p>
            )}
          </div>
        </section>

        {(canEnable ||
          canDisable ||
          canSuspend ||
          canDelete) && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Connector actions
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 p-6">
                {canEnable &&
                  connector.status !==
                  "ACTIVE" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        requestAction(
                          "enable",
                        )
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Enable
                    </button>
                  )}

                {canDisable &&
                  connector.status ===
                  "ACTIVE" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        requestAction(
                          "disable",
                        )
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Disable
                    </button>
                  )}

                {canSuspend &&
                  connector.status ===
                  "ACTIVE" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        requestAction(
                          "suspend",
                        )
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Suspend
                    </button>
                  )}

                {canDelete && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      requestAction(
                        "delete",
                      )
                    }
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
              </div>
            </section>
          )}
      </div>

      <ConfirmModal
        open={confirmationOpen}
        title={
          pendingAction ===
            "delete"
            ? "Delete connector?"
            : pendingAction ===
              "enable"
              ? "Enable connector?"
              : pendingAction ===
                "disable"
                ? "Disable connector?"
                : "Suspend connector?"
        }
        description={
          pendingAction ===
            "delete"
            ? `This will permanently delete ${connector.name}. This action cannot be undone.`
            : pendingAction ===
              "enable"
              ? `This will enable ${connector.name}.`
              : pendingAction ===
                "disable"
                ? `This will disable ${connector.name}.`
                : `This will suspend ${connector.name}.`
        }
        confirmLabel={
          pendingAction ===
            "delete"
            ? "Delete"
            : pendingAction ===
              "enable"
              ? "Enable"
              : pendingAction ===
                "disable"
                ? "Disable"
                : "Suspend"
        }
        confirmingLabel={
          pendingAction ===
            "delete"
            ? "Deleting..."
            : pendingAction ===
              "enable"
              ? "Enabling..."
              : pendingAction ===
                "disable"
                ? "Disabling..."
                : "Suspending..."
        }
        confirming={
          action !== null
        }
        destructive={
          pendingAction ===
          "delete"
        }
        onConfirm={
          handleConfirm
        }
        onCancel={
          handleCancel
        }
      />
    </main>
  );
}