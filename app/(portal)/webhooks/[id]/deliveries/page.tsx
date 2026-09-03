import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findWebhookById,
} from "@/features/webhooks/api/server-webhooks.api";

import {
  WebhookDeliveriesClient,
} from "@/features/webhooks/components/webhook-deliveries-client";

// ============================================================================
// Webhook deliveries page
// ============================================================================

export default async function WebhookDeliveriesPage({
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

  const canReadWebhooks =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_READ,
    );

  if (!canReadWebhooks) {
    notFound();
  }

  const canReadDeliveries =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_DELIVERIES_READ,
    );

  if (!canReadDeliveries) {
    notFound();
  }

  // ==========================================================================
  // Route parameters
  // ==========================================================================

  const routeParams =
    await params;

  const webhookId =
    routeParams.id?.trim() ||
    "";

  if (!webhookId) {
    notFound();
  }

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const queryParams =
    await searchParams;

  const clientId =
    queryParams.clientId?.trim() ||
    "";

  if (!clientId) {
    notFound();
  }

  // ==========================================================================
  // Webhook
  // ==========================================================================

  let webhook;

  try {
    webhook =
      await findWebhookById(
        clientId,
        webhookId,
      );
  } catch (error) {
    console.error(
      "[WebhookDeliveries] Unable to load webhook.",
      error,
    );

    notFound();
  }

  if (!webhook) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <WebhookDeliveriesClient
      clientId={clientId}
      webhook={webhook}
    />
  );
}
