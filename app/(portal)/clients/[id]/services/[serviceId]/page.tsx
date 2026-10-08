import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  ClientServicesApiError,
  findClientServiceById,
} from "@/features/client-services/api/client-services-server";

import ClientServiceDetailsClient from "@/features/client-services/components/client-service-details-client";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Client Service details page
// ============================================================================

export default async function ClientServiceDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
}) {
  // ==========================================================================
  // Route parameters
  // ==========================================================================

  const {
    id: clientId,
    serviceId,
  } = await params;

  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Effective permissions
  // ==========================================================================

  const permissionNames =
    new Set<string>();

  for (
    const role of authenticatedUser.roles
  ) {
    for (
      const permission of role.permissions
    ) {
      permissionNames.add(
        permission.name,
      );
    }
  }

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_READ,
    );

  if (!canReadClientServices) {
    notFound();
  }

  const canUpdateClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_UPDATE,
    );

  const canEnableClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_ENABLE,
    );

  const canDisableClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_DISABLE,
    );

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let clientService;

  try {
    clientService =
      await findClientServiceById(
        clientId,
        serviceId,
      );
  } catch (error) {
    if (
      error instanceof ClientServicesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    /*
     * Let the client component display the error state rather than making
     * the entire route unusable.
     */
    console.error(
      "[Client Service] Unable to load client service.",
      error,
    );

    clientService = null;
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <ClientServiceDetailsClient
      clientId={clientId}
      initialClientService={
        clientService
      }
      canUpdate={
        canUpdateClientServices
      }
      canEnable={
        canEnableClientServices
      }
      canDisable={
        canDisableClientServices
      }
    />
  );
}