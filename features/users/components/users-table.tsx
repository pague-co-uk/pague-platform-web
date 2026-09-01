"use client";

import type {
  UserSummary,
} from "../types/user";

interface UsersTableProps {
  users: readonly UserSummary[];
  onView: (
    user: UserSummary,
  ) => void;
  onEdit: (
    user: UserSummary,
  ) => void;
  onActivate: (
    user: UserSummary,
  ) => void;
  onDeactivate: (
    user: UserSummary,
  ) => void;
  onUnlock: (
    user: UserSummary,
  ) => void;
  onDelete: (
    user: UserSummary,
  ) => void;
}

export function UsersTable({
  users,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onUnlock,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* ==================================================================
          Desktop table
      ================================================================== */}

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                User
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Username
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Email
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Security
              </th>

              <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map(
              (user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onView={onView}
                  onEdit={onEdit}
                  onActivate={
                    onActivate
                  }
                  onDeactivate={
                    onDeactivate
                  }
                  onUnlock={
                    onUnlock
                  }
                  onDelete={
                    onDelete
                  }
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================================
          Mobile cards
      ================================================================== */}

      <div className="divide-y divide-slate-100 md:hidden">
        {users.map(
          (user) => (
            <MobileUserCard
              key={user.id}
              user={user}
              onView={onView}
              onEdit={onEdit}
              onActivate={
                onActivate
              }
              onDeactivate={
                onDeactivate
              }
              onUnlock={
                onUnlock
              }
              onDelete={
                onDelete
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Desktop row
// ============================================================================

interface UserActions {
  onView: (
    user: UserSummary,
  ) => void;
  onEdit: (
    user: UserSummary,
  ) => void;
  onActivate: (
    user: UserSummary,
  ) => void;
  onDeactivate: (
    user: UserSummary,
  ) => void;
  onUnlock: (
    user: UserSummary,
  ) => void;
  onDelete: (
    user: UserSummary,
  ) => void;
}

function UserRow({
  user,
  ...actions
}: {
  user: UserSummary;
} & UserActions) {
  return (
    <tr className="transition hover:bg-slate-50/60">

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() =>
            actions.onView(
              user,
            )
          }
          className="group flex cursor-pointer items-center gap-3 text-left"
        >
          <UserAvatar
            user={user}
          />

          <span>
            <span className="block text-sm font-medium text-slate-800 group-hover:text-blue-600">
              {user.firstName}{" "}
              {user.lastName}
            </span>

            <span className="block text-xs text-slate-400">
              {user.username}
            </span>
          </span>
        </button>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {user.username}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {user.email}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <SecurityBadge
            enabled={
              user.mfaEnabled
            }
          />

          {user.locked && (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
              Locked
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          active={
            user.active
          }
        />
      </td>

      <td className="px-3 py-4">
        <UserActionMenu
          user={user}
          {...actions}
        />
      </td>
    </tr>
  );
}

// ============================================================================
// Mobile card
// ============================================================================

function MobileUserCard({
  user,
  ...actions
}: {
  user: UserSummary;
} & UserActions) {
  return (
    <div className="p-4">

      <div className="flex items-start justify-between gap-3">

        <button
          type="button"
          onClick={() =>
            actions.onView(
              user,
            )
          }
          className="flex min-w-0 cursor-pointer items-center gap-3 text-left"
        >
          <UserAvatar
            user={user}
          />

          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-800">
              {user.firstName}{" "}
              {user.lastName}
            </span>

            <span className="block truncate text-xs text-slate-400">
              {user.email}
            </span>
          </span>
        </button>

        <UserActionMenu
          user={user}
          {...actions}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusBadge
          active={
            user.active
          }
        />

        {user.locked && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
            Locked
          </span>
        )}

        {user.mfaEnabled && (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700">
            MFA enabled
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Avatar
// ============================================================================

function UserAvatar({
  user,
}: {
  user: UserSummary;
}) {
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
      {initials}
    </span>
  );
}

// ============================================================================
// Status
// ============================================================================

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active
            ? "bg-emerald-500"
            : "bg-slate-400",
        ].join(" ")}
      />

      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}

// ============================================================================
// Security
// ============================================================================

function SecurityBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-2 py-1 text-[10px] font-medium",
        enabled
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-400",
      ].join(" ")}
    >
      {enabled
        ? "MFA"
        : "No MFA"}
    </span>
  );
}

// ============================================================================
// Actions
// ============================================================================

function UserActionMenu({
  user,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onUnlock,
  onDelete,
}: {
  user: UserSummary;
} & UserActions) {
  return (
    <details className="relative">
      <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle
            cx="5"
            cy="12"
            r="1.5"
          />

          <circle
            cx="12"
            cy="12"
            r="1.5"
          />

          <circle
            cx="19"
            cy="12"
            r="1.5"
          />
        </svg>
      </summary>

      <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10">

        <ActionButton
          label="View"
          onClick={() =>
            onView(user)
          }
        />

        <ActionButton
          label="Edit"
          onClick={() =>
            onEdit(user)
          }
        />

        <div className="my-1 border-t border-slate-100" />

        {user.active ? (
          <ActionButton
            label="Deactivate"
            onClick={() =>
              onDeactivate(
                user,
              )
            }
          />
        ) : (
          <ActionButton
            label="Activate"
            onClick={() =>
              onActivate(
                user,
              )
            }
          />
        )}

        {user.locked && (
          <ActionButton
            label="Unlock"
            onClick={() =>
              onUnlock(user)
            }
          />
        )}

        <div className="my-1 border-t border-slate-100" />

        <ActionButton
          label="Delete"
          danger
          onClick={() =>
            onDelete(user)
          }
        />
      </div>
    </details>
  );
}

// ============================================================================
// Action button
// ============================================================================

function ActionButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
      ].join(" ")}
    >
      {label}
    </button>
  );
}