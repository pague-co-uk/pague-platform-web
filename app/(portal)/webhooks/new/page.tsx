import { notFound, redirect } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import {
  CreateWebhookClient,
} from "@/features/webhooks/components/create-webhook-client";

export default async function NewWebhookPage({
  searchParams,
}: {
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
      PERMISSIONS.WEBHOOKS_CREATE,
    )
  ) {
    notFound();
  }

  if (
    !permissionNames.has(
      PERMISSIONS.CLIENTS_READ,
    )
  ) {
    notFound();
  }

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const params =
    await searchParams;

  const clientId =
    params.clientId?.trim();

  if (!clientId) {
    redirect("/webhooks");
  }

  // ==========================================================================
  // Load client
  // ==========================================================================

  let client;

  try {
    client =
      await findClientById(
        clientId,
      );
  } catch (error) {
    console.error(
      "[Webhooks] Unable to load client for webhook creation.",
      error,
    );

    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <CreateWebhookClient
      clientId={client.id}
      clientName={
        client.displayName ||
        client.companyName
      }
      clientPublicId={
        client.publicId
      }
    />
  );
}