import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";


import {
  findWebhookById,
} from "@/features/webhooks/api/server-webhooks.api";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { EditWebhookClient } from "@/features/webhooks/components/edit-webhook-client";

interface EditWebhookPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    clientId?: string;
  }>;
}

export default async function EditWebhookPage({
  params,
  searchParams,
}: EditWebhookPageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    notFound();
  }

  const permissionNames =
    new Set<string>();

  for (const role of user.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(
        permission.name,
      );
    }
  }

  if (
    !permissionNames.has(
      PERMISSIONS.WEBHOOKS_UPDATE,
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

  const routeParams =
    await params;

  const queryParams =
    await searchParams;

  const clientId =
    queryParams.clientId;

  if (!clientId) {
    notFound();
  }

  try {
    const [
      client,
      webhook,
    ] = await Promise.all([
      findClientById(clientId),
      findWebhookById(
        clientId,
        routeParams.id,
      ),
    ]);

    if (!client || !webhook) {
      notFound();
    }

    return (
      <EditWebhookClient
        clientId={clientId}
        clientName={client.displayName}
        webhook={webhook}
      />
    );
  } catch (error) {
    console.error(
      "[EditWebhookPage] Failed to load webhook.",
      error,
    );

    notFound();
  }
}