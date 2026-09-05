"use client";

import {
  useState,
} from "react";

import Link from "next/link";

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
  useToast,
} from "@/components/ui/toast";

import {
  activateSmppAccount,
  changeSmppPassword,
  disableSmppAccount,
  updateSmppAccount,
  type SmppAccount,
} from "@/features/smpp-accounts/api/smpp-accounts-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface SmppAccountDetailsClientProps {
  readonly client: Client;
  readonly account: SmppAccount;
  readonly canUpdateSmppAccounts: boolean;
  readonly canChangeSmppPasswords: boolean;
  readonly canActivateSmppAccounts: boolean;
  readonly canDisableSmppAccounts: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function SmppAccountDetailsClient({
  client,
  account,
  canUpdateSmppAccounts,
  canChangeSmppPasswords,
  canActivateSmppAccounts,
  canDisableSmppAccounts,
}: SmppAccountDetailsClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    showPasswordForm,
    setShowPasswordForm,
  ] = useState(false);

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    editingSettings,
    setEditingSettings,
  ] = useState(false);

  const [
    maxConcurrentBinds,
    setMaxConcurrentBinds,
  ] = useState(
    String(
      account.maxConcurrentBinds,
    ),
  );

  const [
    enquireLinkInterval,
    setEnquireLinkInterval,
  ] = useState(
    String(
      account.enquireLinkInterval,
    ),
  );

  const [
    savingSettings,
    setSavingSettings,
  ] = useState(false);

  // ==========================================================================
  // URLs
  // ==========================================================================

  const clientName =
    client.displayName ||
    client.companyName;

  const clientUrl =
    `/clients/${encodeURIComponent(
      client.id,
    )}`;

  const smppAccountsUrl =
    `/clients/${encodeURIComponent(
      client.id,
    )}/smpp-accounts`;

  // ==========================================================================
  // Status
  // ==========================================================================

  const isActive =
    account.status === "ACTIVE";

  const isDisabled =
    account.status === "DISABLED";

  const isSuspended =
    account.status === "SUSPENDED";

  // ==========================================================================
  // Activate
  // ==========================================================================

  async function handleActivate() {
    if (
      updatingStatus ||
      !canActivateSmppAccounts
    ) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await activateSmppAccount(
        client.id,
        account.id,
      );

      success(
        "SMPP account activated",
        "The SMPP account is now active.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[SMPP Accounts] Unable to activate SMPP account.",
        error,
      );

      showError(
        "Unable to activate SMPP account",
        error instanceof Error
          ? error.message
          : "Unable to activate SMPP account.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ==========================================================================
  // Disable
  // ==========================================================================

  async function handleDisable() {
    if (
      updatingStatus ||
      !canDisableSmppAccounts
    ) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await disableSmppAccount(
        client.id,
        account.id,
      );

      success(
        "SMPP account disabled",
        "The SMPP account has been disabled.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[SMPP Accounts] Unable to disable SMPP account.",
        error,
      );

      showError(
        "Unable to disable SMPP account",
        error instanceof Error
          ? error.message
          : "Unable to disable SMPP account.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ==========================================================================
  // Password
  // ==========================================================================

  async function handleChangePassword() {
    if (
      changingPassword ||
      !canChangeSmppPasswords
    ) {
      return;
    }

    if (!password) {
      showError(
        "Password required",
        "Enter a new SMPP password.",
      );

      return;
    }

    if (password.length < 8) {
      showError(
        "Invalid password",
        "The SMPP password must contain at least 8 characters.",
      );

      return;
    }

    if (password.length > 255) {
      showError(
        "Invalid password",
        "The SMPP password cannot be longer than 255 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      showError(
        "Passwords do not match",
        "Enter the same password in both fields.",
      );

      return;
    }

    setChangingPassword(true);

    try {
      await changeSmppPassword(
        client.id,
        account.id,
        password,
      );

      success(
        "Password changed",
        "The SMPP account password has been changed successfully.",
      );

      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      router.refresh();
    } catch (error) {
      console.error(
        "[SMPP Accounts] Unable to change SMPP password.",
        error,
      );

      showError(
        "Unable to change password",
        error instanceof Error
          ? error.message
          : "Unable to change the SMPP account password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // ==========================================================================
  // Settings
  // ==========================================================================

  async function handleSaveSettings() {
    if (
      savingSettings ||
      !canUpdateSmppAccounts
    ) {
      return;
    }

    const concurrentBinds =
      Number(
        maxConcurrentBinds,
      );

    if (
      !Number.isInteger(
        concurrentBinds,
      ) ||
      concurrentBinds < 1
    ) {
      showError(
        "Invalid concurrent binds",
        "Maximum concurrent binds must be a whole number greater than zero.",
      );

      return;
    }

    const interval =
      Number(
        enquireLinkInterval,
      );

    if (
      !Number.isInteger(
        interval,
      ) ||
      interval < 5 ||
      interval > 3600
    ) {
      showError(
        "Invalid enquire-link interval",
        "The enquire-link interval must be a whole number between 5 and 3600 seconds.",
      );

      return;
    }

    setSavingSettings(true);

    try {
      await updateSmppAccount(
        client.id,
        account.id,
        {
          maxConcurrentBinds:
            concurrentBinds,

          enquireLinkInterval:
            interval,
        },
      );

      success(
        "Settings updated",
        "The SMPP account settings have been updated successfully.",
      );

      setEditingSettings(false);

      router.refresh();
    } catch (error) {
      console.error(
        "[SMPP Accounts] Unable to update SMPP account.",
        error,
      );

      showError(
        "Unable to update settings",
        error instanceof Error
          ? error.message
          : "Unable to update the SMPP account settings.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Back link
      ======================================================================= */}

      <div className="mb-5">
        <Link
          href={smppAccountsUrl}
          className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
        >
          ← Back to SMPP Accounts
        </Link>
      </div>

      {/* ======================================================================
          Centered content
      ======================================================================= */}

      <div className="mx-auto w-full max-w-5xl">

        {/* ====================================================================
            Header
        ===================================================================== */}

        <div className="mb-5">
          <PageHeader
            title={account.systemId}
            description={`SMPP account for ${clientName}.`}
          >
            <StatusBadge
              tone={
                isActive
                  ? "success"
                  : isSuspended
                    ? "warning"
                    : "neutral"
              }
              dot
            >
              {account.status}
            </StatusBadge>
          </PageHeader>
        </div>

        {/* ====================================================================
            Client
        ===================================================================== */}

        <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Client
            </h2>
          </div>

          <div className="px-4 py-3.5 sm:px-5">
            <Link
              href={clientUrl}
              className="text-sm font-medium text-slate-900 transition hover:text-blue-600"
            >
              {clientName}
            </Link>

            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
              {client.id}
            </p>
          </div>
        </section>

        {/* ====================================================================
            Account information
        ===================================================================== */}

        <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Account information
            </h2>

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Connection credentials and operational settings for this SMPP
              account.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-5 px-4 py-4 sm:grid-cols-2 sm:px-5">

            {/* ================================================================
                System ID
            ================================================================= */}

            <DetailItem
              label="System ID"
              value={account.systemId}
              mono
            />

            {/* ================================================================
                Public ID
            ================================================================= */}

            <DetailItem
              label="Public ID"
              value={account.publicId}
              mono
            />

            {/* ================================================================
                Status
            ================================================================= */}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Status
              </p>

              <div className="mt-1">
                <StatusBadge
                  tone={
                    isActive
                      ? "success"
                      : isSuspended
                        ? "warning"
                        : "neutral"
                  }
                  dot
                >
                  {account.status}
                </StatusBadge>
              </div>
            </div>

            {/* ================================================================
                Client ID
            ================================================================= */}

            <DetailItem
              label="Client ID"
              value={account.clientId}
              mono
            />

            {/* ================================================================
                Created
            ================================================================= */}

            <DetailItem
              label="Created"
              value={formatDate(
                account.createdAt,
              )}
            />

            {/* ================================================================
                Updated
            ================================================================= */}

            <DetailItem
              label="Last updated"
              value={formatDate(
                account.updatedAt,
              )}
            />

          </div>
        </section>

        {/* ====================================================================
            Connection settings
        ===================================================================== */}

        <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Connection settings
            </h2>

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Control the number of simultaneous binds and SMPP keepalive
              interval.
            </p>
          </div>

          {!editingSettings ? (
            <div className="grid gap-x-8 gap-y-5 px-4 py-4 sm:grid-cols-2 sm:px-5">

              <DetailItem
                label="Maximum concurrent binds"
                value={String(
                  account.maxConcurrentBinds,
                )}
              />

              <DetailItem
                label="Enquire-link interval"
                value={`${account.enquireLinkInterval} seconds`}
              />

            </div>
          ) : (
            <div className="space-y-4 px-4 py-4 sm:px-5">

              {/* ==============================================================
                  Concurrent binds
              =============================================================== */}

              <div>
                <label
                  htmlFor="maxConcurrentBinds"
                  className="block text-xs font-medium text-slate-700"
                >
                  Maximum concurrent binds
                </label>

                <input
                  id="maxConcurrentBinds"
                  type="number"
                  min={1}
                  step={1}
                  value={maxConcurrentBinds}
                  onChange={(event) =>
                    setMaxConcurrentBinds(
                      event.target.value,
                    )
                  }
                  disabled={savingSettings}
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* ==============================================================
                  Enquire-link interval
              =============================================================== */}

              <div>
                <label
                  htmlFor="enquireLinkInterval"
                  className="block text-xs font-medium text-slate-700"
                >
                  Enquire-link interval
                </label>

                <div className="mt-1.5 flex">
                  <input
                    id="enquireLinkInterval"
                    type="number"
                    min={5}
                    max={3600}
                    step={1}
                    value={enquireLinkInterval}
                    onChange={(event) =>
                      setEnquireLinkInterval(
                        event.target.value,
                      )
                    }
                    disabled={savingSettings}
                    className="block h-9 min-w-0 flex-1 rounded-l-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span className="inline-flex h-9 items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
                    seconds
                  </span>
                </div>
              </div>

              {/* ==============================================================
                  Edit actions
              =============================================================== */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMaxConcurrentBinds(
                      String(
                        account.maxConcurrentBinds,
                      ),
                    );

                    setEnquireLinkInterval(
                      String(
                        account.enquireLinkInterval,
                      ),
                    );

                    setEditingSettings(
                      false,
                    );
                  }}
                  disabled={savingSettings}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSaveSettings
                  }
                  disabled={savingSettings}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingSettings
                    ? "Saving…"
                    : "Save settings"}
                </button>
              </div>
            </div>
          )}

          {!editingSettings &&
            canUpdateSmppAccounts && (
              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() =>
                    setEditingSettings(
                      true,
                    )
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit settings
                </button>
              </div>
            )}
        </section>

        {/* ====================================================================
            Password
        ===================================================================== */}

        {canChangeSmppPasswords && (
          <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Password
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Change the password used by the SMPP client to authenticate.
              </p>
            </div>

            {!showPasswordForm ? (
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    SMPP authentication password
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    The current password is never displayed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordForm(
                      true,
                    )
                  }
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Change password
                </button>
              </div>
            ) : (
              <div className="space-y-4 px-4 py-4 sm:px-5">

                {/* ============================================================
                    New password
                ============================================================= */}

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-medium text-slate-700"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    minLength={8}
                    maxLength={255}
                    autoComplete="new-password"
                    disabled={
                      changingPassword
                    }
                    className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* ============================================================
                    Confirm password
                ============================================================= */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    minLength={8}
                    maxLength={255}
                    autoComplete="new-password"
                    disabled={
                      changingPassword
                    }
                    className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* ============================================================
                    Actions
                ============================================================= */}

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPassword("");
                      setConfirmPassword("");
                      setShowPasswordForm(
                        false,
                      );
                    }}
                    disabled={
                      changingPassword
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleChangePassword
                    }
                    disabled={
                      changingPassword
                    }
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword
                      ? "Changing…"
                      : "Change password"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ====================================================================
            Account actions
        ===================================================================== */}

        {(canActivateSmppAccounts ||
          canDisableSmppAccounts) && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Account actions
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Manage the lifecycle state of this SMPP account.
                </p>
              </div>

              <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {isActive
                      ? "Disable account"
                      : "Activate account"}
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {isActive
                      ? "Prevent this account from establishing new SMPP sessions."
                      : "Allow this account to authenticate and establish SMPP sessions."}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {isActive &&
                    canDisableSmppAccounts && (
                      <button
                        type="button"
                        onClick={
                          handleDisable
                        }
                        disabled={
                          updatingStatus
                        }
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingStatus
                          ? "Disabling…"
                          : "Disable account"}
                      </button>
                    )}

                  {!isActive &&
                    canActivateSmppAccounts && (
                      <button
                        type="button"
                        onClick={
                          handleActivate
                        }
                        disabled={
                          updatingStatus
                        }
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingStatus
                          ? "Activating…"
                          : "Activate account"}
                      </button>
                    )}
                </div>
              </div>
            </section>
          )}
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Detail item
// ============================================================================

interface DetailItemProps {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

function DetailItem({
  label,
  value,
  mono = false,
}: DetailItemProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-0.5 break-all text-sm text-slate-700",
          mono
            ? "font-mono text-xs"
            : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Date formatting
// ============================================================================

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    },
  ).format(
    new Date(value),
  );
}