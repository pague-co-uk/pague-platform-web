"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";

import {
  EmptyState,
} from "@/components/ui/empty-state";

import {
  ErrorState,
} from "@/components/ui/error-state";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";

import {
  LoadingState,
} from "@/components/ui/loading-state";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  SortButton,
} from "@/components/ui/sort-button";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  ConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast";

import {
  activateUser,
  deactivateUser,
  deleteUser,
  findUsers,
  unlockUser,
  UsersApiError,
} from "@/features/users/api/users-api";

import type {
  UserStatus,
  UserSummary,
} from "@/features/users/types/user";

// ============================================================================
// Users page
// ============================================================================

export default function UsersPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    rows,
    setRows,
  ] = useState<
    readonly UserSummary[]
  >([]);

  const [
    meta,
    setMeta,
  ] = useState<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null,
  );

  const [
    userToDelete,
    setUserToDelete,
  ] = useState<UserSummary | null>(
    null,
  );

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const search =
    searchParams.get(
      "search",
    ) ?? undefined;

  const status =
    searchParams.get(
      "status",
    ) as UserStatus | undefined;

  const page =
    Number(
      searchParams.get(
        "page",
      ) ?? "1",
    );

  const pageSize =
    Number(
      searchParams.get(
        "pageSize",
      ) ?? "20",
    );

  const sortBy =
    searchParams.get(
      "sort",
    ) ?? undefined;

  const sortDirection =
    (searchParams.get(
      "direction",
    ) as
      | "asc"
      | "desc"
      | null) ??
    undefined;

  // ==========================================================================
  // Load users
  // ==========================================================================

  const loadUsers =
    useCallback(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result =
            await findUsers({
              search,
              status,
              page,
              pageSize,
              sortBy,
              sortDirection,
            });

          setRows(
            result.items,
          );

          setMeta(
            result.meta,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to load users.",
            error,
          );

          setError(
            error instanceof
              UsersApiError
              ? error.message
              : "Unable to load users. Please try again.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        search,
        status,
        page,
        pageSize,
        sortBy,
        sortDirection,
      ],
    );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // ==========================================================================
  // Open user
  // ==========================================================================

  const openUser =
    useCallback(
      (id: string) => {
        router.push(
          `/users/${id}`,
        );
      },
      [router],
    );

  // ==========================================================================
  // Activate
  // ==========================================================================

  const handleActivate =
    useCallback(
      async (
        user: UserSummary,
      ) => {
        try {
          await activateUser(
            user.id,
          );

          await loadUsers();

          success(
            "User activated",
            `${user.username} is now active.`,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to activate user.",
            error,
          );

          showError(
            "Unable to activate user",
            getActionError(
              error,
              "Please try again.",
            ),
          );
        }
      },
      [
        loadUsers,
        success,
        showError,
      ],
    );

  // ==========================================================================
  // Deactivate
  // ==========================================================================

  const handleDeactivate =
    useCallback(
      async (
        user: UserSummary,
      ) => {
        try {
          await deactivateUser(
            user.id,
          );

          await loadUsers();

          success(
            "User deactivated",
            `${user.username} has been deactivated.`,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to deactivate user.",
            error,
          );

          showError(
            "Unable to deactivate user",
            getActionError(
              error,
              "Please try again.",
            ),
          );
        }
      },
      [
        loadUsers,
        success,
        showError,
      ],
    );

  // ==========================================================================
  // Unlock
  // ==========================================================================

  const handleUnlock =
    useCallback(
      async (
        user: UserSummary,
      ) => {
        try {
          await unlockUser(
            user.id,
          );

          await loadUsers();

          success(
            "User unlocked",
            `${user.username} has been unlocked.`,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to unlock user.",
            error,
          );

          showError(
            "Unable to unlock user",
            getActionError(
              error,
              "Please try again.",
            ),
          );
        }
      },
      [
        loadUsers,
        success,
        showError,
      ],
    );

  // ==========================================================================
  // Open delete confirmation
  // ==========================================================================

  const handleDelete =
    useCallback(
      (user: UserSummary) => {
        setUserToDelete(
          user,
        );
      },
      [],
    );

  // ==========================================================================
  // Confirm delete
  // ==========================================================================

  const confirmDelete =
    useCallback(
      async () => {
        if (!userToDelete) {
          return;
        }

        const user =
          userToDelete;

        setDeletingId(
          user.id,
        );

        try {
          await deleteUser(
            user.id,
          );

          setUserToDelete(
            null,
          );

          await loadUsers();

          success(
            "User deleted",
            `${user.username} was deleted successfully.`,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to delete user.",
            error,
          );

          showError(
            "Unable to delete user",
            getActionError(
              error,
              "Please try again.",
            ),
          );
        } finally {
          setDeletingId(
            null,
          );
        }
      },
      [
        userToDelete,
        loadUsers,
        success,
        showError,
      ],
    );

  // ==========================================================================
  // Cancel delete
  // ==========================================================================

  const cancelDelete =
    useCallback(() => {
      if (deletingId) {
        return;
      }

      setUserToDelete(
        null,
      );
    }, [deletingId]);

  // ==========================================================================
  // Columns
  // ==========================================================================

  const columns =
    useMemo<
      readonly DataTableColumn<UserSummary>[]
    >(
      () => [
        // ====================================================================
        // User
        // ====================================================================

        {
          key: "user",

          header: "User",

          className:
            "min-w-[220px]",

          render: (
            user,
          ) => (
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={
                  user.firstName
                }
                lastName={
                  user.lastName
                }
              />

              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-800">
                  {
                    user.firstName
                  }{" "}
                  {
                    user.lastName
                  }
                </span>

                <span className="block truncate text-xs text-slate-400">
                  {
                    user.username
                  }
                </span>
              </span>
            </div>
          ),
        },

        // ====================================================================
        // Email
        // ====================================================================

        {
          key: "email",

          header: (
            <SortButton
              field="email"
              label="Email"
            />
          ),

          className:
            "min-w-[220px]",

          render: (
            user,
          ) => (
            <span className="truncate text-slate-600">
              {
                user.email
              }
            </span>
          ),
        },

        // ====================================================================
        // Username
        // ====================================================================

        {
          key: "username",

          header: (
            <SortButton
              field="username"
              label="Username"
            />
          ),

          className:
            "min-w-[150px]",

          render: (
            user,
          ) => (
            <span className="text-slate-600">
              {
                user.username
              }
            </span>
          ),
        },

        // ====================================================================
        // Status
        // ====================================================================

        {
          key: "status",

          header: "Status",

          className:
            "min-w-[130px]",

          render: (
            user,
          ) => (
            <UserStatusBadge
              user={user}
            />
          ),
        },

        // ====================================================================
        // Security
        // ====================================================================

        {
          key: "security",

          header: "Security",

          className:
            "min-w-[130px]",

          render: (
            user,
          ) => (
            <div className="flex flex-wrap gap-1.5">
              {user.mfaEnabled && (
                <StatusBadge
                  tone="info"
                >
                  MFA
                </StatusBadge>
              )}

              {user.locked && (
                <StatusBadge
                  tone="warning"
                >
                  Locked
                </StatusBadge>
              )}
            </div>
          ),
        },

        // ====================================================================
        // Actions
        // ====================================================================

        {
          key: "actions",

          header: "",

          className:
            "w-12 text-right",

          render: (
            user,
          ) => (
            <UserActions
              user={user}
              deleting={
                deletingId ===
                user.id
              }
              onView={() =>
                openUser(
                  user.id,
                )
              }
              onActivate={() =>
                void handleActivate(
                  user,
                )
              }
              onDeactivate={() =>
                void handleDeactivate(
                  user,
                )
              }
              onUnlock={() =>
                void handleUnlock(
                  user,
                )
              }
              onDelete={() =>
                handleDelete(
                  user,
                )
              }
            />
          ),
        },
      ],
      [
        deletingId,
        openUser,
        handleActivate,
        handleDeactivate,
        handleUnlock,
        handleDelete,
      ],
    );

  // ==========================================================================
  // Filters
  // ==========================================================================

  const hasFilters =
    Boolean(
      search ||
      status,
    );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage the users who have access to your Pague account."
      />

      {/* ====================================================================
          Filters
      ==================================================================== */}

      <FilterBar>
        <FilterSearch
          placeholder="Search users..."
        />

        <FilterSelect
          name="status"
          placeholder="All statuses"
          options={[
            {
              value: "ACTIVE",
              label: "Active",
            },
            {
              value: "LOCKED",
              label: "Locked",
            },
            {
              value: "DISABLED",
              label: "Disabled",
            },
          ]}
        />

        <button
          type="button"
          onClick={() =>
            router.push(
              "/users/new",
            )
          }
          className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
          <PlusIcon />

          <span className="ml-1.5">
            Add user
          </span>
        </button>
      </FilterBar>

      {/* ====================================================================
          Content
      ==================================================================== */}

      <div className="mt-4">
        {isLoading ? (
          <LoadingState rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <ErrorState
              title="Unable to load users"
              description={
                error
              }
            >
              <button
                type="button"
                onClick={() =>
                  void loadUsers()
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </ErrorState>
          </div>
        ) : rows.length ===
          0 ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <EmptyState
              title="No users found"
              description={
                hasFilters
                  ? "Try adjusting your search or filters."
                  : "Create your first user to give them access to Pague."
              }
            >
              {!hasFilters && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/users/new",
                    )
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Add user
                </button>
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={
                columns
              }
              rows={rows}
              getRowKey={(
                user,
              ) =>
                user.id
              }
              onRowClick={(
                user,
              ) =>
                openUser(
                  user.id,
                )
              }
            />

            {meta && (
              <Pagination
                meta={meta}
              />
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          Delete confirmation
      ==================================================================== */}

      <ConfirmModal
        open={
          userToDelete !== null
        }
        title="Delete user?"
        description={
          userToDelete ? (
            <>
              You are about to
              permanently delete{" "}
              <span className="font-medium text-slate-700">
                {
                  userToDelete.firstName
                }{" "}
                {
                  userToDelete.lastName
                }
              </span>{" "}
              (
              <span className="font-medium text-slate-700">
                {
                  userToDelete.username
                }
              </span>
              ). This action
              cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Delete user"
        cancelLabel="Cancel"
        confirming={
          deletingId ===
          userToDelete?.id
        }
        destructive
        onConfirm={
          confirmDelete
        }
        onCancel={
          cancelDelete
        }
      />
    </PageContainer>
  );
}

// ============================================================================
// User status
// ============================================================================

function getUserStatus(
  user: UserSummary,
): UserStatus {
  if (user.locked) {
    return "LOCKED";
  }

  if (!user.active) {
    return "DISABLED";
  }

  return "ACTIVE";
}

// ============================================================================
// Status badge
// ============================================================================

function UserStatusBadge({
  user,
}: {
  user: UserSummary;
}) {
  const status =
    getUserStatus(user);

  const tone =
    status === "ACTIVE"
      ? "success"
      : status === "LOCKED"
        ? "warning"
        : "neutral";

  return (
    <StatusBadge
      tone={tone}
    >
      {status}
    </StatusBadge>
  );
}

// ============================================================================
// Avatar
// ============================================================================

function UserAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {initials}
    </span>
  );
}

// ============================================================================
// Actions
// ============================================================================

interface UserActionsProps {
  user: UserSummary;

  deleting: boolean;

  onView: () => void;

  onActivate: () => void;

  onDeactivate: () => void;

  onUnlock: () => void;

  onDelete: () => void;
}

function UserActions({
  user,
  deleting,
  onView,
  onActivate,
  onDeactivate,
  onUnlock,
  onDelete,
}: UserActionsProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  // ==========================================================================
  // Close on outside click
  // ==========================================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      const target =
        event.target;

      if (
        !(target instanceof Node)
      ) {
        return;
      }

      if (
        containerRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, [open]);

  // ==========================================================================
  // Close on Escape
  // ==========================================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        event.preventDefault();

        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  // ==========================================================================
  // Action helper
  // ==========================================================================

  const closeAndRun = (
    action: () => void,
  ) => {
    setOpen(false);
    action();
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {/* ====================================================================
          Trigger
      ==================================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
        aria-label={`Actions for ${user.username}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle
            cx="5"
            cy="12"
            r="1"
          />

          <circle
            cx="12"
            cy="12"
            r="1"
          />

          <circle
            cx="19"
            cy="12"
            r="1"
          />
        </svg>
      </button>

      {/* ====================================================================
          Menu
      ==================================================================== */}

      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${user.username}`}
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10"
        >
          <ActionButton
            label="View user"
            onClick={() =>
              closeAndRun(
                onView,
              )
            }
          />

          {user.locked ? (
            <ActionButton
              label="Unlock user"
              onClick={() =>
                closeAndRun(
                  onUnlock,
                )
              }
            />
          ) : user.active ? (
            <ActionButton
              label="Deactivate user"
              onClick={() =>
                closeAndRun(
                  onDeactivate,
                )
              }
            />
          ) : (
            <ActionButton
              label="Activate user"
              onClick={() =>
                closeAndRun(
                  onActivate,
                )
              }
            />
          )}

          <div className="my-1 border-t border-slate-100" />

          <ActionButton
            label={
              deleting
                ? "Deleting..."
                : "Delete"
            }
            danger
            disabled={
              deleting
            }
            onClick={() =>
              closeAndRun(
                onDelete,
              )
            }
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Action button
// ============================================================================

function ActionButton({
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  label: string;

  onClick: () => void;

  danger?: boolean;

  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ============================================================================
// Plus icon
// ============================================================================

function PlusIcon() {
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
        d="M12 5v14M5 12h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// Error helper
// ============================================================================

function getActionError(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof
    UsersApiError
  ) {
    return error.message;
  }

  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return fallback;
}