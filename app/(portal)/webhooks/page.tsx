import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import {
  findWebhooks,
} from "@/features/webhooks/api/server-webhooks.api";

import {
  WebhooksClient,
} from "@/features/webhooks/components/webhooks-client";

// ============================================================================
// Webhooks page
// ============================================================================

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    page?: string;
    pageSize?: string;
    enabled?: string;
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

  const canReadClients =
    permissionNames.has(
      PERMISSIONS.CLIENTS_READ,
    );

  if (!canReadClients) {
    notFound();
  }

  const canCreateWebhooks =
    permissionNames.has(
      PERMISSIONS.WEBHOOKS_CREATE,
    );

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const params =
    await searchParams;

  const clientId =
    params.clientId?.trim() ||
    "";

  const page =
    parsePositiveInteger(
      params.page,
      1,
    );

  const pageSize =
    parsePageSize(
      params.pageSize,
      20,
    );

  const enabled =
    parseBoolean(
      params.enabled,
    );

  // ==========================================================================
  // Initial clients
  //
  // We load the clients independently from the selected webhook client.
  // ==========================================================================

  let clients;

  try {
    clients =
      await findClients({
        page: 1,
        pageSize: 100,
      });
  } catch (error) {
    console.error(
      "[Webhooks] Unable to load clients.",
      error,
    );

    clients = null;
  }

  // ==========================================================================
  // Initial webhooks
  //
  // Webhooks are client-scoped, so only load them when a client is selected.
  // ==========================================================================

  let webhooks = null;

  if (clientId) {
    try {
      webhooks =
        await findWebhooks({
          clientId,
          page,
          pageSize,
          enabled,
        });
    } catch (error) {
      console.error(
        "[Webhooks] Unable to load webhooks.",
        error,
      );

      webhooks = null;
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <WebhooksClient
      clients={
        clients
          ? clients.items.map(
            (client) => ({
              id: client.id,
              publicId:
                client.publicId,
              companyName:
                client.companyName,
              displayName:
                client.displayName,
            }),
          )
          : []
      }
      webhooks={
        webhooks
          ? webhooks.data
          : []
      }
      pagination={
        webhooks
          ? webhooks.pagination
          : null
      }
      canCreateWebhooks={
        canCreateWebhooks
      }
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function parsePageSize(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 100
  ) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}