import { redirect } from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import {
  findRoles,
} from "@/features/roles/api/server-roles-api";

import CreateUserClient, {
  ClientOption,
} from "./create-user-client";

import type {
  RoleOption,
} from "@/components/users/role-selector";
import { PERMISSIONS } from "@/lib/authorization/permissions";

// ============================================================================
// Create user page
// ============================================================================

export default async function CreateUserPage() {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    redirect("/login");
  }

  // ==========================================================================
  // Page capability
  // ==========================================================================

  const canSelectClient =
    authenticatedUser.roles.some(
      (role) =>
        role.name ===
        "PLATFORM_SUPER_ADMIN",
    );
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
  // Clients
  // ==========================================================================

  let clients:
    readonly ClientOption[] =
    [];

  if (canSelectClient) {
    const result =
      await findClients({
        page: 1,
        pageSize: 100,
      });

    clients =
      result.items.map(
        (client) => ({
          id: client.id,

          name:
            client.displayName ||
            client.companyName,
        }),
      );
  }

  // ==========================================================================
  // Roles
  // ==========================================================================

  let roles:
    readonly RoleOption[] =
    [];

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
    <PageContainer>
      <PageHeader
        title="Create user"
        description="Create a user who can access your Pague account."
      />

      <CreateUserClient
        canSelectClient={
          canSelectClient
        }
        clients={clients}
        canAssignRoles={
          canAssignRoles
        }
        roles={roles}
      />
    </PageContainer>
  );
}