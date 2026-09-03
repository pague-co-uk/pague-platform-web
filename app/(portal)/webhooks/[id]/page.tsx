import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import { findWebhookById } from "@/features/webhooks/api/server-webhooks.api";
import {
  WebhookDetailsClient,
} from "@/features/webhooks/components/webhook-details-client";

export default async function WebhookDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    clientId?: string;
  }>;
}) {
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

  if (
    !permissionNames.has(
      PERMISSIONS.WEBHOOKS_READ,
    )
  ) {
    notFound();
  }

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_UPDATE,
    );

  const canDelete =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_DELETE,
    );

  const canRotateSecret =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_ROTATE_SECRET,
    );

  const canReadDeliveries =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_DELIVERIES_READ,
    );

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const routeParams =
    await params;

  const queryParams =
    await searchParams;

  const clientId =
    queryParams.clientId?.trim();

  if (!clientId) {
    notFound();
  }

  // ==========================================================================
  // Load webhook
  // ==========================================================================

  let webhook;

  try {
    webhook =
      await findWebhookById(
        clientId,
        routeParams.id,
      );
  } catch (error) {
    console.error(
      "[Webhooks] Unable to load webhook.",
      error,
    );

    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <WebhookDetailsClient
      clientId={clientId}
      webhook={webhook}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canRotateSecret={
        canRotateSecret
      }
      canReadDeliveries={
        canReadDeliveries
      }
    />
  );
}