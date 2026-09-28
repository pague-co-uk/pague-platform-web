import { redirect } from "next/navigation";

import {
  findRoleById,
} from "@/features/access-control/api/server-roles-api";

import {
  findPermissions,
} from "@/features/access-control/api/server-permissions-api";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import { RolePermission } from "@/features/access-control/api/roles-api";
import RoleDetailsClient from "./role-details-client";

interface RoleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleDetailsPage({
  params,
}: RoleDetailsPageProps) {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================================
  // Page capability
  // ==========================================================================

  const canReadRoles =
    user.roles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.name ===
          PERMISSIONS.ROLES_READ,
      ),
    );

  if (!canReadRoles) {
    redirect("/403");
  }

  const canUpdate =
    user.roles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.name ===
          PERMISSIONS.ROLES_UPDATE,
      ),
    );

  const canDelete =
    user.roles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.name ===
          PERMISSIONS.ROLES_DELETE,
      ),
    );

  const canManagePermissions =
    user.roles.some(
      (role) =>
        role.name ===
        "PLATFORM_SUPER_ADMIN",
    );

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const { id } =
    await params;

  // ==========================================================================
  // Role
  // ==========================================================================

  try {
    const role =
      await findRoleById(id);

    // ========================================================================
    // Permission catalogue
    // ========================================================================

    let permissions: readonly RolePermission[] = [];

    if (canManagePermissions) {
      const permissionsResult =
        await findPermissions({
          page: 1,
          pageSize: 100,
        });

      permissions =
        permissionsResult.items;
    }

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <RoleDetailsClient
        role={role}
        permissions={permissions}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canManagePermissions={
          canManagePermissions
        }
      />
    );
  } catch (error) {
    console.error(
      "Failed to load role details:",
      error,
    );

    redirect(
      "/access-control/roles",
    );
  }
}