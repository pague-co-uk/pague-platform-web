import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import NewRoleClient from "./new-role-client";

export default async function NewRolePage() {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    redirect("/login");
  }

  const canCreateRoles =
    authenticatedUser.roles.some(
      (role) =>
        role.permissions.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.ROLES_CREATE,
        ),
    );

  if (!canCreateRoles) {
    redirect("/403");
  }

  return (
    <NewRoleClient />
  );
}