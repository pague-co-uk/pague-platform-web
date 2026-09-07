import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { findWebhookById } from "@/features/webhooks/api/server-webhooks.api";
import { EditWebhookClient } from "@/features/webhooks/components/edit-webhook-client";

interface EditWebhookPageProps {
  readonly params: Promise<{
    id: string;
    webhookId: string;
  }>;
}

export default async function ClientEditWebhookPage({
  params,
}: EditWebhookPageProps) {
  const { id: clientId, webhookId } = await params;

  const authenticatedUser = await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissions = new Set(
    authenticatedUser.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    ),
  );

  if (!permissions.has(PERMISSIONS.WEBHOOKS_UPDATE)) {
    notFound();
  }

  if (!permissions.has(PERMISSIONS.CLIENTS_READ)) {
    notFound();
  }

  const [client, webhook] = await Promise.all([
    findClientById(clientId),
    findWebhookById(clientId, webhookId),
  ]);

  if (!client || !webhook) {
    notFound();
  }

  return (
    <EditWebhookClient
      clientId={clientId}
      clientName={client.displayName || client.companyName}
      webhook={webhook}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
