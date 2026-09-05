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

import RoleDetailsClient from "./role-details-client";

interface RoleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleDetailsPage({
  params,
}: RoleDetailsPageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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

  const { id } =
    await params;

  try {
    const [
      role,
      permissionsResult,
    ] = await Promise.all([
      findRoleById(id),
      findPermissions({
        page: 1,
        pageSize: 100,
      }),
    ]);

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

    return (
      <RoleDetailsClient
        role={role}
        permissions={
          permissionsResult.items
        }
        canUpdate={canUpdate}
        canDelete={canDelete}
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