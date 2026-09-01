"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  findUserById,
} from "@/features/users/api/users-api";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  LoadingState,
} from "@/components/ui/loading-state";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ErrorState,
} from "@/components/ui/error-state";

import {
  useToast,
} from "@/components/ui/toast";

import RoleSelector, {
  RoleOption,
} from "@/components/users/role-selector";

import type {
  User,
} from "@/features/users/types/user";

// ============================================================================
// Types
// ============================================================================

interface UserDetailsClientProps {
  readonly userId: string;

  /**
   * Whether the authenticated user has USERS_ROLES_UPDATE.
   *
   * This is calculated by the server page from the authenticated user's
   * effective permissions.
   */
  readonly canAssignRoles: boolean;

  /**
   * Roles available for assignment.
   *
   * These are loaded server-side by the page using server-roles-api.ts.
   */
  readonly roles: readonly RoleOption[];
}

// ============================================================================
// User details page
// ============================================================================

export default function UserDetailsClient({
  userId,
  canAssignRoles,
  roles,
}: UserDetailsClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // User
  // ==========================================================================

  const [
    user,
    setUser,
  ] = useState<User | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  // ==========================================================================
  // User actions
  // ==========================================================================

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ==========================================================================
  // Role assignment
  // ==========================================================================

  const [
    selectedRoleIds,
    setSelectedRoleIds,
  ] = useState<
    readonly string[]
  >([]);

  const [
    savingRoles,
    setSavingRoles,
  ] = useState(false);

  // ==========================================================================
  // Load user
  // ==========================================================================

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const result =
          await findUserById(
            userId,
          );

        if (cancelled) {
          return;
        }

        setUser(result);

        setSelectedRoleIds(
          result.roles.map(
            (role) =>
              role.id,
          ),
        );
      } catch (error) {
        console.error(
          "[Users] Unable to load user.",
          error,
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load user.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ==========================================================================
  // Derived values
  // ==========================================================================

  const fullName =
    user
      ? `${user.firstName} ${user.lastName}`
      : "";

  const initials =
    user
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        .toUpperCase()
      : "";

  // ==========================================================================
  // Effective permissions
  // ==========================================================================

  const permissions =
    useMemo(() => {
      if (!user) {
        return [];
      }

      const permissionMap =
        new Map<
          string,
          {
            id: string;
            name: string;
            description: string;
            module: string;
          }
        >();

      for (
        const role of user.roles
      ) {
        for (
          const permission of role.permissions
        ) {
          permissionMap.set(
            permission.id,
            permission,
          );
        }
      }

      return Array.from(
        permissionMap.values(),
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
          ),
      );
    }, [user]);

  // ==========================================================================
  // Activate
  // ==========================================================================

  async function activateUser() {
    await performAction(
      "activate",
    );
  }

  // ==========================================================================
  // Deactivate
  // ==========================================================================

  async function deactivateUser() {
    await performAction(
      "deactivate",
    );
  }

  // ==========================================================================
  // Unlock
  // ==========================================================================

  async function unlockUser() {
    await performAction(
      "unlock",
    );
  }

  // ==========================================================================
  // User actions
  // ==========================================================================

  async function performAction(
    action:
      | "activate"
      | "deactivate"
      | "unlock",
  ) {
    if (
      actionLoading ||
      savingRoles ||
      !user
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const response =
        await fetch(
          `/api/users/${encodeURIComponent(userId)}/${action}`,
          {
            method: "POST",

            credentials:
              "include",

            cache:
              "no-store",
          },
        );

      const body =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      // ======================================================================
      // Authentication failure
      // ======================================================================

      if (
        response.status ===
        401
      ) {
        router.replace(
          "/login",
        );

        return;
      }

      // ======================================================================
      // API error
      // ======================================================================

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            `Unable to ${action} user.`,
          ),
        );
      }

      // ======================================================================
      // Update user
      // ======================================================================

      if (
        isApiUserResponse(
          body,
        )
      ) {
        setUser(
          body.data,
        );

        setSelectedRoleIds(
          body.data.roles.map(
            (role) =>
              role.id,
          ),
        );
      } else {
        const refreshed =
          await findUserById(
            userId,
          );

        setUser(
          refreshed,
        );

        setSelectedRoleIds(
          refreshed.roles.map(
            (role) =>
              role.id,
          ),
        );
      }

      // ======================================================================
      // Success notification
      // ======================================================================

      success(
        getActionSuccessTitle(
          action,
        ),
        getActionSuccessDescription(
          action,
          user.username,
        ),
      );
    } catch (error) {
      console.error(
        `[Users] Unable to ${action} user.`,
        error,
      );

      showError(
        getActionErrorTitle(
          action,
        ),
        error instanceof Error
          ? error.message
          : `Unable to ${action} user.`,
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================================
  // Save roles
  // ==========================================================================

  async function saveRoles() {
    if (
      savingRoles ||
      actionLoading ||
      !user ||
      !canAssignRoles
    ) {
      return;
    }

    setSavingRoles(true);

    try {
      const response =
        await fetch(
          `/api/users/${encodeURIComponent(userId)}/roles`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            cache:
              "no-store",

            body: JSON.stringify({
              roleIds:
                selectedRoleIds,
            }),
          },
        );

      const body =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      // ======================================================================
      // Authentication failure
      // ======================================================================

      if (
        response.status ===
        401
      ) {
        router.replace(
          "/login",
        );

        return;
      }

      // ======================================================================
      // Authorization failure
      // ======================================================================

      if (
        response.status ===
        403
      ) {
        throw new Error(
          getErrorMessage(
            body,
            "You are not permitted to change this user's roles.",
          ),
        );
      }

      // ======================================================================
      // API error
      // ======================================================================

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            `Unable to update roles. HTTP ${response.status}.`,
          ),
        );
      }

      // ======================================================================
      // Update local user
      // ======================================================================

      if (
        isApiUserResponse(
          body,
        )
      ) {
        setUser(
          body.data,
        );

        setSelectedRoleIds(
          body.data.roles.map(
            (role) =>
              role.id,
          ),
        );
      } else {
        const refreshed =
          await findUserById(
            userId,
          );

        setUser(
          refreshed,
        );

        setSelectedRoleIds(
          refreshed.roles.map(
            (role) =>
              role.id,
          ),
        );
      }

      // ======================================================================
      // Success
      // ======================================================================

      success(
        "Roles updated",
        `${user.username}'s role assignments have been updated successfully.`,
      );
    } catch (error) {
      console.error(
        "[Users] Failed to assign roles.",
        error,
      );

      showError(
        "Unable to update roles",
        error instanceof Error
          ? error.message
          : "Unable to update user roles.",
      );
    } finally {
      setSavingRoles(false);
    }
  }

  // ==========================================================================
  // Loading
  // ==========================================================================

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="User"
          description="View user account details."
        />

        <LoadingState
          rows={6}
        />
      </PageContainer>
    );
  }

  // ==========================================================================
  // Error
  // ==========================================================================

  if (
    error ||
    !user
  ) {
    return (
      <PageContainer>
        <PageHeader
          title="User"
          description="View user account details."
        />

        <div className="rounded-xl border border-slate-200 bg-white">
          <ErrorState
            title="Unable to load user"
            description={
              error ??
              "We couldn't find this user."
            }
          >
            <Link
              href="/users"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              Back to users
            </Link>
          </ErrorState>
        </div>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="User details"
        description="View and manage this user's account."
      />

      {/* ======================================================================
          Breadcrumb
      ======================================================================= */}

      <div className="mb-5">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeftIcon />

          Back to users
        </Link>
      </div>

      {/* ======================================================================
          User identity
      ======================================================================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold text-slate-900">
                  {fullName}
                </h2>

                <StatusBadge
                  tone={
                    user.active
                      ? "success"
                      : "neutral"
                  }
                >
                  {user.active
                    ? "Active"
                    : "Disabled"}
                </StatusBadge>

                {user.locked && (
                  <StatusBadge
                    tone="danger"
                  >
                    Locked
                  </StatusBadge>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                @{user.username}
              </p>
            </div>
          </div>

          {/* ==================================================================
              Actions
          =================================================================== */}

          <div className="flex flex-wrap items-center gap-2">
            {user.locked && (
              <button
                type="button"
                onClick={
                  unlockUser
                }
                disabled={
                  actionLoading ||
                  savingRoles
                }
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Working…"
                  : "Unlock user"}
              </button>
            )}

            {user.active ? (
              <button
                type="button"
                onClick={
                  deactivateUser
                }
                disabled={
                  actionLoading ||
                  savingRoles
                }
                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Working…"
                  : "Deactivate"}
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  activateUser
                }
                disabled={
                  actionLoading ||
                  savingRoles
                }
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Working…"
                  : "Activate"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          Main grid
      ======================================================================= */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* ====================================================================
            Account information
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white xl:col-span-2">
          <SectionHeader
            title="Account information"
            description="Basic information associated with this account."
          />

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <InfoItem
              label="First name"
              value={
                user.firstName
              }
            />

            <InfoItem
              label="Last name"
              value={
                user.lastName
              }
            />

            <InfoItem
              label="Username"
              value={
                user.username
              }
            />

            <InfoItem
              label="Email"
              value={
                user.email
              }
            />

            <InfoItem
              label="Client ID"
              value={
                user.clientId
              }
              mono
            />

            <InfoItem
              label="User ID"
              value={
                user.id
              }
              mono
            />
          </div>
        </section>

        {/* ====================================================================
            Account status
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white">
          <SectionHeader
            title="Account status"
            description="Current security and account state."
          />

          <div className="space-y-4 p-5">
            <StatusRow
              label="Account"
              value={
                user.active
                  ? "Active"
                  : "Disabled"
              }
              tone={
                user.active
                  ? "success"
                  : "neutral"
              }
            />

            <StatusRow
              label="Lock status"
              value={
                user.locked
                  ? "Locked"
                  : "Not locked"
              }
              tone={
                user.locked
                  ? "danger"
                  : "success"
              }
            />

            <StatusRow
              label="Multi-factor authentication"
              value={
                user.mfaEnabled
                  ? "Enabled"
                  : "Disabled"
              }
              tone={
                user.mfaEnabled
                  ? "success"
                  : "neutral"
              }
            />
          </div>
        </section>

        {/* ====================================================================
            Role assignment
        ===================================================================== */}

        {canAssignRoles && (
          <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
            <SectionHeader
              title="Role assignment"
              description="Manage the roles assigned to this user."
              trailing={
                <StatusBadge
                  tone="neutral"
                >
                  {
                    selectedRoleIds.length
                  }{" "}
                  selected
                </StatusBadge>
              }
            />

            {roles.length ===
              0 ? (
              <div className="p-5 sm:p-6">
                <p className="text-sm text-slate-500">
                  No roles are available
                  for assignment.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <RoleSelector
                  roles={roles}
                  value={
                    selectedRoleIds
                  }
                  onChange={
                    setSelectedRoleIds
                  }
                  disabled={
                    savingRoles ||
                    actionLoading
                  }
                />

                <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    Saving replaces the
                    user's complete role
                    assignment.
                  </p>

                  <button
                    type="button"
                    onClick={
                      saveRoles
                    }
                    disabled={
                      savingRoles ||
                      actionLoading
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingRoles && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}

                    {savingRoles
                      ? "Saving roles…"
                      : "Save roles"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ====================================================================
            Assigned roles
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
          <SectionHeader
            title="Assigned roles"
            description="Roles currently assigned to this user."
          />

          {user.roles.length ===
            0 ? (
            <EmptyRoles />
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {user.roles.map(
                (role) => (
                  <div
                    key={
                      role.id
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {role.name}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {role.description ??
                            "No description provided."}
                        </p>
                      </div>

                      <StatusBadge
                        tone="info"
                        dot={
                          false
                        }
                      >
                        {
                          role
                            .permissions
                            .length
                        }{" "}
                        permissions
                      </StatusBadge>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* ====================================================================
            Permissions
        ===================================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white xl:col-span-3">
          <SectionHeader
            title="Permissions"
            description="Effective permissions inherited from the user's assigned roles."
            trailing={
              <StatusBadge
                tone="neutral"
              >
                {
                  permissions.length
                }{" "}
                total
              </StatusBadge>
            }
          />

          {permissions.length ===
            0 ? (
            <EmptyRoles
              title="No permissions"
              description="This user does not currently have any permissions."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Permission
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Module
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Description
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {permissions.map(
                    (
                      permission,
                    ) => (
                      <tr
                        key={
                          permission.id
                        }
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3.5">
                          <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                            {
                              permission.name
                            }
                          </code>
                        </td>

                        <td className="px-5 py-3.5">
                          <StatusBadge
                            tone="neutral"
                            dot={
                              false
                            }
                          >
                            {
                              permission.module
                            }
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {
                            permission.description
                          }
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Action messages
// ============================================================================

function getActionSuccessTitle(
  action:
    | "activate"
    | "deactivate"
    | "unlock",
): string {
  switch (action) {
    case "activate":
      return "User activated";

    case "deactivate":
      return "User deactivated";

    case "unlock":
      return "User unlocked";
  }
}

function getActionSuccessDescription(
  action:
    | "activate"
    | "deactivate"
    | "unlock",
  username: string,
): string {
  switch (action) {
    case "activate":
      return `${username} has been activated successfully.`;

    case "deactivate":
      return `${username} has been deactivated successfully.`;

    case "unlock":
      return `${username} has been unlocked successfully.`;
  }
}

function getActionErrorTitle(
  action:
    | "activate"
    | "deactivate"
    | "unlock",
): string {
  switch (action) {
    case "activate":
      return "Unable to activate user";

    case "deactivate":
      return "Unable to deactivate user";

    case "unlock":
      return "Unable to unlock user";
  }
}

// ============================================================================
// Section header
// ============================================================================

interface SectionHeaderProps {
  title: string;

  description?: string;

  trailing?: React.ReactNode;
}

function SectionHeader({
  title,
  description,
  trailing,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {trailing}
    </div>
  );
}

// ============================================================================
// Info item
// ============================================================================

interface InfoItemProps {
  label: string;

  value: string;

  mono?: boolean;
}

function InfoItem({
  label,
  value,
  mono = false,
}: InfoItemProps) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1.5 break-all text-sm text-slate-800",
          mono
            ? "font-mono text-xs"
            : "font-medium",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Status row
// ============================================================================

interface StatusRowProps {
  label: string;

  value: string;

  tone:
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";
}

function StatusRow({
  label,
  value,
  tone,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <StatusBadge
        tone={tone}
      >
        {value}
      </StatusBadge>
    </div>
  );
}

// ============================================================================
// Empty roles
// ============================================================================

interface EmptyRolesProps {
  title?: string;

  description?: string;
}

function EmptyRoles({
  title = "No roles assigned",
  description = "This user does not currently have any roles assigned.",
}: EmptyRolesProps) {
  return (
    <div className="px-5 py-10 text-center sm:px-6">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path
            d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// API response validation
// ============================================================================

function isApiUserResponse(
  value: unknown,
): value is {
  success: true;
  data: User;
} {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  if (
    !("success" in value) ||
    value.success !== true
  ) {
    return false;
  }

  return (
    "data" in value &&
    typeof value.data ===
    "object" &&
    value.data !== null
  );
}

// ============================================================================
// Error handling
// ============================================================================

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return fallback;
  }

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null
  ) {
    const error =
      data.error;

    if (
      "message" in error &&
      typeof error.message ===
      "string" &&
      error.message.trim()
    ) {
      return error.message;
    }
  }

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}

// ============================================================================
// Chevron left
// ============================================================================

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}