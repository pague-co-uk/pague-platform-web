import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import { findUserById } from "@/features/users/api/server-users-api";

import {
  findRoles,
} from "@/features/roles/api/server-roles-api";

import type {
  RoleOption,
} from "@/components/users/role-selector";

import { PERMISSIONS } from "@/lib/authorization/permissions";
import UserDetailsClient from "./user-details-client";

// ============================================================================
// User details page
// ============================================================================

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Load user
  // ==========================================================================

  /*
   * We load the target user here to make sure the requested user exists
   * before rendering the page.
   *
   * UserDetailsClient also loads the user because it needs to refresh the
   * user after account actions and role changes.
   */
  const user =
    await findUserById(id);

  if (!user) {
    notFound();
  }

  // ==========================================================================
  // Determine role assignment permission
  // ==========================================================================

  /*
   * Role assignment is controlled by the authenticated user's effective
   * permissions.
   *
   * The permission is granted when ANY assigned role contains
   * USERS_ROLES_UPDATE.
   */
  const canAssignRoles =
    authenticatedUser.roles.some(
      (role) =>
        role.permissions.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.USERS_ROLES_UPDATE
        ),
    );

  // ==========================================================================
  // Load available roles
  // ==========================================================================

  let roles: readonly RoleOption[] =
    [];

  /*
   * Only retrieve the role catalogue when the authenticated user is
   * permitted to assign roles.
   *
   * This keeps the role data out of the page for users who cannot use
   * the role-assignment functionality.
   */
  if (canAssignRoles) {
    const result =
      await findRoles({
        page: 1,
        pageSize: 100,
      });

    roles =
      result.items.map(
        (role) => ({
          id: role.id,
          name: role.name,
          description:
            role.description,
        }),
      );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <UserDetailsClient
      userId={id}
      canAssignRoles={
        canAssignRoles
      }
      roles={roles}
    />
  );
}