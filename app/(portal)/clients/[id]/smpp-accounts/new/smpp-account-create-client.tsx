"use client";

import {
  FormEvent,
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
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  useToast,
} from "@/components/ui/toast";

import {
  createSmppAccount,
} from "@/features/smpp-accounts/api/smpp-accounts-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface SmppAccountCreateClientProps {
  readonly client: Client;
  readonly showPlatformBackLink: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function SmppAccountCreateClient({
  client,
  showPlatformBackLink,
}: SmppAccountCreateClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    systemId,
    setSystemId,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    maxConcurrentBinds,
    setMaxConcurrentBinds,
  ] = useState("");

  const [
    enquireLinkInterval,
    setEnquireLinkInterval,
  ] = useState("");

  const [
    ipAllowlist,
    setIpAllowlist,
  ] = useState<string[]>([]);

  const [
    ipAddressInput,
    setIpAddressInput,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
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
  // IP Allowlist
  // ==========================================================================

  function handleAddIpAddress() {
    const ipAddress =
      ipAddressInput.trim();

    if (!ipAddress) {
      showError(
        "IP address required",
        "Enter an IP address to add to the allowlist.",
      );

      return;
    }

    if (
      ipAllowlist.includes(
        ipAddress,
      )
    ) {
      showError(
        "Duplicate IP address",
        "This IP address is already in the allowlist.",
      );

      return;
    }

    setIpAllowlist(
      (current) => [
        ...current,
        ipAddress,
      ],
    );

    setIpAddressInput("");
  }

  function handleRemoveIpAddress(
    ipAddress: string,
  ) {
    setIpAllowlist(
      (current) =>
        current.filter(
          (address) =>
            address !== ipAddress,
        ),
    );
  }

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmedSystemId =
      systemId.trim();

    if (!trimmedSystemId) {
      showError(
        "System ID required",
        "Enter a system ID for the SMPP account.",
      );

      return;
    }

    if (trimmedSystemId.length > 50) {
      showError(
        "Invalid System ID",
        "The System ID cannot be longer than 50 characters.",
      );

      return;
    }

    if (!password) {
      showError(
        "Password required",
        "Enter a password for the SMPP account.",
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

    let maxConcurrentBindsValue:
      number |
      undefined;

    if (
      maxConcurrentBinds.trim()
    ) {
      const value =
        Number(
          maxConcurrentBinds,
        );

      if (
        !Number.isInteger(value) ||
        value < 1
      ) {
        showError(
          "Invalid concurrent binds",
          "Maximum concurrent binds must be a whole number greater than zero.",
        );

        return;
      }

      maxConcurrentBindsValue =
        value;
    }

    let enquireLinkIntervalValue:
      number |
      undefined;

    if (
      enquireLinkInterval.trim()
    ) {
      const value =
        Number(
          enquireLinkInterval,
        );

      if (
        !Number.isInteger(value) ||
        value < 5 ||
        value > 3600
      ) {
        showError(
          "Invalid enquire-link interval",
          "The enquire-link interval must be a whole number between 5 and 3600 seconds.",
        );

        return;
      }

      enquireLinkIntervalValue =
        value;
    }

    setSubmitting(true);

    try {
      const account =
        await createSmppAccount(
          client.id,
          {
            systemId:
              trimmedSystemId,

            password,

            ipAllowlist,

            ...(maxConcurrentBindsValue !==
              undefined
              ? {
                maxConcurrentBinds:
                  maxConcurrentBindsValue,
              }
              : {}),

            ...(enquireLinkIntervalValue !==
              undefined
              ? {
                enquireLinkInterval:
                  enquireLinkIntervalValue,
              }
              : {}),
          },
        );

      success(
        "SMPP account created",
        "The SMPP account has been created successfully.",
      );

      router.push(
        `${smppAccountsUrl}/${encodeURIComponent(
          account.id,
        )}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[SMPP Accounts] Unable to create SMPP account.",
        error,
      );

      showError(
        "Unable to create SMPP account",
        error instanceof Error
          ? error.message
          : "Unable to create SMPP account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <div className="mb-5">
        <ContextAwareBackLinks
          showPlatformLink={
            showPlatformBackLink
          }
          platformHref="/smpp-accounts"
          platformLabel="Back to SMPP Accounts"
          clientHref={
            smppAccountsUrl
          }
          clientLabel="Back to Client SMPP Accounts"
        />
      </div>

      <div className="mx-auto w-full max-w-2xl">

        <div className="mb-5">
          <PageHeader
            title="Create SMPP account"
            description={`Create an SMPP credential for ${clientName}.`}
          />
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
            Form
        ===================================================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <section>
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-900">
                SMPP account details
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Define the SMPP credentials and connection limits for this
                account.
              </p>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5">

              {/* ==============================================================
                  System ID
              =============================================================== */}

              <div>
                <label
                  htmlFor="systemId"
                  className="block text-xs font-medium text-slate-700"
                >
                  System ID
                </label>

                <input
                  id="systemId"
                  name="systemId"
                  type="text"
                  value={systemId}
                  onChange={(event) =>
                    setSystemId(
                      event.target.value,
                    )
                  }
                  maxLength={50}
                  required
                  placeholder="customer_system"
                  autoComplete="username"
                  disabled={submitting}
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  The SMPP system ID used when establishing a bind.
                </p>
              </div>

              {/* ==============================================================
                  Password
              =============================================================== */}

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  maxLength={255}
                  required
                  placeholder="Enter SMPP password"
                  autoComplete="new-password"
                  disabled={submitting}
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Minimum 8 characters. This password is used by the SMPP
                  client to authenticate.
                </p>
              </div>

              {/* ==============================================================
                  Maximum concurrent binds
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
                  name="maxConcurrentBinds"
                  type="number"
                  min={1}
                  step={1}
                  value={maxConcurrentBinds}
                  onChange={(event) =>
                    setMaxConcurrentBinds(
                      event.target.value,
                    )
                  }
                  placeholder="Default"
                  disabled={submitting}
                  className="mt-1.5 block h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Optional. Limits the number of simultaneous SMPP binds for
                  this account.
                </p>
              </div>

              {/* ==============================================================
                  Enquire link interval
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
                    name="enquireLinkInterval"
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
                    placeholder="Default"
                    disabled={submitting}
                    className="block h-9 min-w-0 flex-1 rounded-l-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span className="inline-flex h-9 items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
                    seconds
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  Optional. Must be between 5 and 3600 seconds.
                </p>
              </div>

              {/* ==============================================================
                  IP allowlist
              =============================================================== */}

              <div>
                <label
                  htmlFor="ipAddress"
                  className="block text-xs font-medium text-slate-700"
                >
                  Allowed IP addresses
                </label>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Only these IP addresses will be permitted to establish SMPP
                  binds. Leave the list empty to create the account without
                  allowing any SMPP connections.
                </p>

                <div className="mt-2 flex gap-2">
                  <input
                    id="ipAddress"
                    type="text"
                    value={ipAddressInput}
                    onChange={(event) =>
                      setIpAddressInput(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();
                        handleAddIpAddress();
                      }
                    }}
                    placeholder="e.g. 192.168.1.100"
                    disabled={submitting}
                    className="block h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddIpAddress
                    }
                    disabled={submitting}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add IP
                  </button>
                </div>

                {ipAllowlist.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {ipAllowlist.map(
                      (ipAddress) => (
                        <div
                          key={ipAddress}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <span className="font-mono text-xs text-slate-700">
                            {ipAddress}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveIpAddress(
                                ipAddress,
                              )
                            }
                            disabled={
                              submitting
                            }
                            className="text-xs font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
                    No IP addresses configured. The account will be created
                    but will not be able to establish an SMPP bind until an IP
                    address is added.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ==================================================================
              Actions
          =================================================================== */}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <Link
              href={smppAccountsUrl}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating…"
                : "Create SMPP account"}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}