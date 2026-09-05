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
  findApiKeys,
} from "@/features/api-keys/api/server-api-keys.api";


import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import { findWebhooks } from "@/features/webhooks/api/server-webhooks.api";
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
    permissions.has(
      PERMISSIONS.CLIENTS_DELETE,
    );

  const canReadApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_READ,
    );

  const canCreateApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_CREATE,
    );

  const canRevokeApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_REVOKE,
    );

  const canReadWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_READ,
    );

  const canCreateWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_CREATE,
    );

  const canUpdateWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_UPDATE,
    );

  const canDeleteWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_DELETE,
    );

  const canRotateWebhookSecrets =
    permissions.has(
      PERMISSIONS.WEBHOOKS_ROTATE_SECRET,
    );

  const canReadWebhookDeliveries =
    permissions.has(
      PERMISSIONS.WEBHOOKS_DELIVERIES_READ,
    );

  // ==========================================================================
  // Load client-scoped resources
  //
  // Only load resources the current user is authorized to read.
  // ==========================================================================

  let apiKeys = null;

  if (canReadApiKeys) {
    apiKeys = await findApiKeys(
      id,
      {
        page: 1,
        pageSize: 5,
      },
    );
  }

  let webhooks = null;

  if (canReadWebhooks) {
    webhooks = await findWebhooks({
      clientId: id,
      page: 1,
      pageSize: 5,
    });
  }

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

      apiKeys={
        apiKeys?.data ?? []
      }

      apiKeysPagination={
        apiKeys?.pagination ?? null
      }

      webhooks={
        webhooks?.data ?? []
      }

      webhooksPagination={
        webhooks?.pagination ?? null
      }

      canReadApiKeys={
        canReadApiKeys
      }

      canCreateApiKeys={
        canCreateApiKeys
      }

      canRevokeApiKeys={
        canRevokeApiKeys
      }

      canReadWebhooks={
        canReadWebhooks
      }

      canCreateWebhooks={
        canCreateWebhooks
      }

      canUpdateWebhooks={
        canUpdateWebhooks
      }

      canDeleteWebhooks={
        canDeleteWebhooks
      }

      canRotateWebhookSecrets={
        canRotateWebhookSecrets
      }

      canReadWebhookDeliveries={
        canReadWebhookDeliveries
      }
    />
  );
}