import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import ClientDetailsClient from "./client-details-client";

// ============================================================================
// Client details page
// ============================================================================

export default async function ClientDetailsPage({
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
  // Authorization
  // ==========================================================================

  const permissions =
    new Set(
      authenticatedUser.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  const canReadClients =
    permissions.has(
      PERMISSIONS.CLIENTS_READ,
    );

  if (!canReadClients) {
    notFound();
  }

  // ==========================================================================
  // Load client
  // ==========================================================================

  const client =
    await findClientById(id);

  if (!client) {
    notFound();
  }

  // ==========================================================================
  // Capabilities
  // ==========================================================================

  const canUpdateClient =
    permissions.has(
      PERMISSIONS.CLIENTS_UPDATE,
    );

  const canActivateClient =
    permissions.has(
      PERMISSIONS.CLIENTS_ACTIVATE,
    );

  const canSuspendClient =
    permissions.has(
      PERMISSIONS.CLIENTS_SUSPEND,
    );

  const canDisableClient =
    permissions.has(
      PERMISSIONS.CLIENTS_DISABLE,
    );

  const canDeleteClient =
    authenticatedUser.roles.some(
      (role) =>
        role.permissions.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.CLIENTS_DELETE,
        ),
    );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <ClientDetailsClient
      client={client}
      canUpdateClient={
        canUpdateClient
      }
      canActivateClient={
        canActivateClient
      }
      canSuspendClient={
        canSuspendClient
      }
      canDisableClient={
        canDisableClient
      }
      canDeleteClient={
        canDeleteClient
      }
    />
  );
}