"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  Route as RouteResponse,
  RouteStatus,
} from "@/features/routes/api/routes-api";
import {
  deleteRoute,
  disableRoute,
  enableRoute,
  RoutesApiError,
} from "@/features/routes/api/routes-api";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

interface RouteDetailsClientProps {
  route: RouteResponse;
  canUpdateRoutes: boolean;
  canDeleteRoutes: boolean;
  canEnableRoutes: boolean;
  canDisableRoutes: boolean;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getStatusTone(
  status: RouteStatus,
): "success" | "danger" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "DISABLED":
      return "danger";

    default:
      return "neutral";
  }
}

function getStatusLabel(status: RouteStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "DISABLED":
      return "Disabled";

    default:
      return status;
  }
}

export default function RouteDetailsClient({
  route: initialRoute,
  canUpdateRoutes,
  canDeleteRoutes,
  canEnableRoutes,
  canDisableRoutes,
}: RouteDetailsClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [route, setRoute] = useState(initialRoute);

  const [action, setAction] = useState<
    "enable" | "disable" | "delete" | null
  >(null);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] =
    useState(false);

  async function handleEnable() {
    setAction("enable");

    try {
      const updatedRoute = await enableRoute(route.id);

      setRoute(updatedRoute);

      success(
        "Route enabled",
        `${updatedRoute.publicId} is now active.`,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof RoutesApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to enable route.";

      showError("Unable to enable route", message);
    } finally {
      setAction(null);
    }
  }

  async function handleDisable() {
    setAction("disable");

    try {
      const updatedRoute = await disableRoute(route.id);

      setRoute(updatedRoute);

      success(
        "Route disabled",
        `${updatedRoute.publicId} has been disabled.`,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof RoutesApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to disable route.";

      showError("Unable to disable route", message);
    } finally {
      setAction(null);
    }
  }

  function handleDeleteRequest() {
    setDeleteConfirmationOpen(true);
  }

  function handleDeleteCancel() {
    if (action === "delete") {
      return;
    }

    setDeleteConfirmationOpen(false);
  }

  async function handleDeleteConfirm() {
    setAction("delete");

    try {
      await deleteRoute(route.id);

      success(
        "Route deleted",
        `${route.publicId} has been deleted.`,
      );

      setDeleteConfirmationOpen(false);

      router.push("/routes");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof RoutesApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete route.";

      showError("Unable to delete route", message);

      setAction(null);
    }
  }

  const busy = action !== null;

  return (
    <>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Link
            href="/routes"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to routes
          </Link>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {route.publicId}
                </h1>

                <StatusBadge
                  tone={getStatusTone(route.status)}
                  dot
                >
                  {getStatusLabel(route.status)}
                </StatusBadge>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Routing configuration and connection details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canUpdateRoutes && (
                <Link
                  href={`/routes/${route.id}/edit`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
              )}

              {route.status === "ACTIVE" &&
                canDisableRoutes && (
                  <button
                    type="button"
                    onClick={handleDisable}
                    disabled={busy}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {action === "disable"
                      ? "Disabling..."
                      : "Disable"}
                  </button>
                )}

              {route.status === "DISABLED" &&
                canEnableRoutes && (
                  <button
                    type="button"
                    onClick={handleEnable}
                    disabled={busy}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {action === "enable"
                      ? "Enabling..."
                      : "Enable"}
                  </button>
                )}

              {canDeleteRoutes && (
                <button
                  type="button"
                  onClick={handleDeleteRequest}
                  disabled={busy}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Route Details
              </h2>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Public ID
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {route.publicId}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Priority
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {route.priority}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </div>
                <div className="mt-2">
                  <StatusBadge
                    tone={getStatusTone(route.status)}
                    dot
                  >
                    {getStatusLabel(route.status)}
                  </StatusBadge>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Route ID
                </div>
                <div className="mt-1 break-all font-mono text-xs text-slate-600">
                  {route.id}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Client
              </h2>
            </div>

            <div className="p-6">
              {route.client ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Company
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">
                      {route.client.companyName}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Display Name
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.client.displayName}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Client ID
                    </div>
                    <div className="mt-1 break-all font-mono text-xs text-slate-600">
                      {route.clientId}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Client information is unavailable.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Mobile Network
              </h2>
            </div>

            <div className="p-6">
              {route.mobileNetwork ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Network
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">
                      {route.mobileNetwork.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Code
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.mobileNetwork.code}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Country
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.mobileNetwork.countryCode}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </div>
                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          route.mobileNetwork.status ===
                            "ACTIVE"
                            ? "success"
                            : "danger"
                        }
                        dot
                      >
                        {route.mobileNetwork.status ===
                          "ACTIVE"
                          ? "Active"
                          : "Disabled"}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Mobile network information is unavailable.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Connector
              </h2>
            </div>

            <div className="p-6">
              {route.connector ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Connector
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">
                      {route.connector.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Code
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.connector.code}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Provider
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.connector.provider}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Transport
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {route.connector.transport}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </div>
                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          route.connector.status ===
                            "ACTIVE"
                            ? "success"
                            : route.connector.status ===
                              "SUSPENDED"
                              ? "warning"
                              : "danger"
                        }
                        dot
                      >
                        {route.connector.status ===
                          "ACTIVE"
                          ? "Active"
                          : route.connector.status ===
                            "SUSPENDED"
                            ? "Suspended"
                            : "Disabled"}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Connector information is unavailable.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Timestamps
              </h2>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(route.createdAt)}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last Updated
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(route.updatedAt)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={deleteConfirmationOpen}
        title="Delete route?"
        description={
          <>
            This will permanently delete{" "}
            <strong>{route.publicId}</strong>. This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Route"
        confirmingLabel="Deleting..."
        cancelLabel="Cancel"
        confirming={action === "delete"}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}