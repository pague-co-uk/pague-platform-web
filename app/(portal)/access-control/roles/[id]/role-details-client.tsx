"use client";

import {
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  deleteRole,
  updateRole,
  updateRolePermissions,
} from "@/features/access-control/api/roles-api";

import type {
  Role,
  RolePermission,
} from "@/features/access-control/api/roles-api";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import { useToast } from "@/components/ui/toast";

interface RoleDetailsClientProps {
  role: Role;
  permissions: readonly RolePermission[];
  canUpdate: boolean;
  canDelete: boolean;
}

export default function RoleDetailsClient({
  role,
  permissions,
  canUpdate,
  canDelete,
}: RoleDetailsClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] =
    useState(role.name);

  const [description, setDescription] =
    useState(role.description ?? "");

  const [editingRole, setEditingRole] =
    useState(false);

  const [selectedPermissions, setSelectedPermissions] =
    useState<Set<string>>(
      () =>
        new Set(
          role.permissions.map(
            (permission) =>
              permission.id,
          ),
        ),
    );

  const [savingRole, setSavingRole] =
    useState(false);

  const [savingPermissions, setSavingPermissions] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /**
   * Group the COMPLETE permission catalogue by module.
   *
   * role.permissions only contains permissions currently
   * assigned to this role. We therefore must use `permissions`
   * here so that unassigned permissions can also be displayed
   * and selected.
   */
  const groupedPermissions =
    useMemo(() => {
      const groups =
        new Map<
          string,
          RolePermission[]
        >();

      for (const permission of permissions) {
        const existing =
          groups.get(permission.module);

        if (existing) {
          existing.push(permission);
        } else {
          groups.set(permission.module, [
            permission,
          ]);
        }
      }

      return Array.from(
        groups.entries(),
      ).sort(([a], [b]) =>
        a.localeCompare(b),
      );
    }, [permissions]);

  function togglePermission(
    permissionId: string,
  ) {
    setSelectedPermissions(
      (current) => {
        const next = new Set(current);

        if (
          next.has(permissionId)
        ) {
          next.delete(permissionId);
        } else {
          next.add(permissionId);
        }

        return next;
      },
    );
  }

  function toggleModule(
    modulePermissions: readonly RolePermission[],
  ) {
    const allSelected =
      modulePermissions.every(
        (permission) =>
          selectedPermissions.has(
            permission.id,
          ),
      );

    setSelectedPermissions(
      (current) => {
        const next = new Set(current);

        for (const permission of modulePermissions) {
          if (allSelected) {
            next.delete(permission.id);
          } else {
            next.add(permission.id);
          }
        }

        return next;
      },
    );
  }

  async function handleSaveRole() {
    if (!name.trim()) {
      toast.error(
        "Role name required",
        "Enter a name for the role.",
      );

      return;
    }

    setSavingRole(true);

    try {
      const updated =
        await updateRole(
          role.id,
          {
            name: name.trim(),
            description:
              description.trim() ||
              undefined,
          },
        );

      setName(updated.name);

      setDescription(
        updated.description ?? "",
      );

      setEditingRole(false);

      toast.success(
        "Role updated",
        "The role details have been updated.",
      );

      router.refresh();
    } catch (error) {
      toast.error(
        "Failed to update role",
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setSavingRole(false);
    }
  }

  async function handleSavePermissions() {
    setSavingPermissions(true);

    try {
      const updated =
        await updateRolePermissions(
          role.id,
          {
            permissionIds:
              Array.from(
                selectedPermissions,
              ),
          },
        );

      setSelectedPermissions(
        new Set(
          updated.permissions.map(
            (permission) =>
              permission.id,
          ),
        ),
      );

      toast.success(
        "Permissions updated",
        "The role permissions have been saved.",
      );

      router.refresh();
    } catch (error) {
      toast.error(
        "Failed to update permissions",
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setSavingPermissions(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete the role "${role.name}"? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteRole(role.id);

      toast.success(
        "Role deleted",
        "The role has been deleted.",
      );

      router.push(
        "/access-control/roles",
      );

      router.refresh();
    } catch (error) {
      toast.error(
        "Failed to delete role",
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );

      setDeleting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={role.name}
        description="View and manage this role and its assigned permissions."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/access-control/roles",
              )
            }
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>

          {canUpdate ? (
            <button
              type="button"
              onClick={() =>
                setEditingRole(
                  (current) =>
                    !current,
                )
              }
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingRole
                ? "Cancel"
                : "Edit role"}
            </button>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex h-10 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
          ) : null}
        </div>
      </PageHeader>

      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Role information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about this role.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="role-name"
                className="block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              {editingRole ? (
                <input
                  id="role-name"
                  type="text"
                  maxLength={100}
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-900">
                  {role.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Type
              </label>

              <div className="mt-2">
                <StatusBadge
                  tone="neutral"
                  dot
                >
                  Role
                </StatusBadge>
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="role-description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              {editingRole ? (
                <textarea
                  id="role-description"
                  maxLength={500}
                  rows={4}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {role.description ||
                    "No description provided."}
                </p>
              )}
            </div>
          </div>

          {editingRole ? (
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                disabled={savingRole}
                onClick={handleSaveRole}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {savingRole
                  ? "Saving..."
                  : "Save role"}
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Permissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the capabilities granted to this role.
              </p>
            </div>

            {canUpdate ? (
              <button
                type="button"
                disabled={
                  savingPermissions
                }
                onClick={
                  handleSavePermissions
                }
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {savingPermissions
                  ? "Saving..."
                  : "Save permissions"}
              </button>
            ) : null}
          </div>

          <div className="divide-y divide-slate-200">
            {groupedPermissions.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">
                  No permissions are available.
                </p>
              </div>
            ) : (
              groupedPermissions.map(
                ([
                  module,
                  modulePermissions,
                ]) => {
                  const selectedCount =
                    modulePermissions.filter(
                      (permission) =>
                        selectedPermissions.has(
                          permission.id,
                        ),
                    ).length;

                  const allSelected =
                    selectedCount ===
                    modulePermissions.length;

                  return (
                    <div
                      key={module}
                      className="px-6 py-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {module}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {selectedCount} of{" "}
                            {
                              modulePermissions.length
                            }{" "}
                            selected
                          </p>
                        </div>

                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleModule(
                                modulePermissions,
                              )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {allSelected
                              ? "Clear all"
                              : "Select all"}
                          </button>
                        ) : null}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {modulePermissions.map(
                          (permission) => {
                            const checked =
                              selectedPermissions.has(
                                permission.id,
                              );

                            return (
                              <label
                                key={
                                  permission.id
                                }
                                className={`flex gap-3 rounded-md border px-4 py-3 transition ${checked
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                  } ${canUpdate
                                    ? "cursor-pointer"
                                    : "cursor-default"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  disabled={
                                    !canUpdate
                                  }
                                  onChange={() =>
                                    togglePermission(
                                      permission.id,
                                    )
                                  }
                                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <span className="min-w-0">
                                  <span className="block text-sm font-medium text-slate-900">
                                    {
                                      permission.name
                                    }
                                  </span>

                                  {permission.description ? (
                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                      {
                                        permission.description
                                      }
                                    </span>
                                  ) : null}
                                </span>
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}