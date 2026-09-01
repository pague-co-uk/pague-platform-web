"use client";

import {
  useMemo,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface RoleOption {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
}

interface RoleSelectorProps {
  readonly roles: readonly RoleOption[];

  readonly value: readonly string[];

  readonly onChange: (
    roleIds: readonly string[],
  ) => void;

  readonly disabled?: boolean;
}

// ============================================================================
// Role selector
// ============================================================================

export default function RoleSelector({
  roles,
  value,
  onChange,
  disabled = false,
}: RoleSelectorProps) {
  const [
    search,
    setSearch,
  ] = useState("");

  const filteredRoles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return roles;
      }

      return roles.filter(
        (role) =>
          role.name
            .toLowerCase()
            .includes(query) ||
          role.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      roles,
      search,
    ]);

  const selectedRoles =
    useMemo(
      () =>
        roles.filter(
          (role) =>
            value.includes(
              role.id,
            ),
        ),
      [
        roles,
        value,
      ],
    );

  function toggleRole(
    roleId: string,
  ) {
    if (disabled) {
      return;
    }

    if (value.includes(roleId)) {
      onChange(
        value.filter(
          (id) =>
            id !== roleId,
        ),
      );

      return;
    }

    onChange([
      ...value,
      roleId,
    ]);
  }

  function removeRole(
    roleId: string,
  ) {
    if (disabled) {
      return;
    }

    onChange(
      value.filter(
        (id) =>
          id !== roleId,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {/* ====================================================================
          Selected roles
      ==================================================================== */}

      {selectedRoles.length >
        0 && (
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map(
              (role) => (
                <span
                  key={
                    role.id
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                >
                  {role.name}

                  <button
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      removeRole(
                        role.id,
                      )
                    }
                    aria-label={`Remove ${role.name}`}
                    className="rounded p-0.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CloseIcon />
                  </button>
                </span>
              ),
            )}
          </div>
        )}

      {/* ====================================================================
          Search
      ==================================================================== */}

      <input
        type="search"
        value={search}
        onChange={(
          event,
        ) =>
          setSearch(
            event.target
              .value,
          )
        }
        disabled={disabled}
        placeholder="Search roles..."
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      {/* ====================================================================
          Role list
      ==================================================================== */}

      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
        {filteredRoles.length ===
          0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No roles found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try a different search.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRoles.map(
              (role) => {
                const selected =
                  value.includes(
                    role.id,
                  );

                return (
                  <button
                    key={
                      role.id
                    }
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      toggleRole(
                        role.id,
                      )
                    }
                    className={[
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                      selected
                        ? "bg-blue-50/60"
                        : "hover:bg-slate-50",
                      disabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer",
                    ].join(
                      " ",
                    )}
                  >
                    <span
                      className={[
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white",
                      ].join(
                        " ",
                      )}
                    >
                      {selected && (
                        <CheckIcon />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {
                          role.name
                        }
                      </span>

                      {role.description && (
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {
                            role.description
                          }
                        </span>
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          Empty state
      ==================================================================== */}

      {roles.length ===
        0 && (
          <p className="text-xs text-amber-600">
            No roles are available for assignment.
          </p>
        )}

      {/* ====================================================================
          Selection count
      ==================================================================== */}

      <p className="text-xs text-slate-400">
        {value.length ===
          0
          ? "No roles selected."
          : `${value.length} ${value.length ===
            1
            ? "role"
            : "roles"
          } selected.`}
      </p>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path
        d="m7 7 10 10M17 7 7 17"
        strokeLinecap="round"
      />
    </svg>
  );
}