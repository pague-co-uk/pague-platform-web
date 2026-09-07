import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { findWebhookById } from "@/features/webhooks/api/server-webhooks.api";
import { WebhookDetailsClient } from "@/features/webhooks/components/webhook-details-client";

interface WebhookDetailsPageProps {
  readonly params: Promise<{
    id: string;
    webhookId: string;
  }>;
}

export default async function ClientWebhookDetailsPage({
  params,
}: WebhookDetailsPageProps) {
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

  if (!permissions.has(PERMISSIONS.WEBHOOKS_READ)) {
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
    <WebhookDetailsClient
      clientId={clientId}
      webhook={webhook}
      canUpdate={permissions.has(PERMISSIONS.WEBHOOKS_UPDATE)}
      canDelete={permissions.has(PERMISSIONS.WEBHOOKS_DELETE)}
      canRotateSecret={permissions.has(PERMISSIONS.WEBHOOKS_ROTATE_SECRET)}
      canReadDeliveries={permissions.has(PERMISSIONS.WEBHOOKS_DELIVERIES_READ)}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
