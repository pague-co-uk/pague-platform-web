import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findWebhookById } from "@/features/webhooks/api/server-webhooks.api";
import { WebhookDeliveriesClient } from "@/features/webhooks/components/webhook-deliveries-client";

interface WebhookDeliveriesPageProps {
  readonly params: Promise<{
    id: string;
    webhookId: string;
  }>;
}

export default async function ClientWebhookDeliveriesPage({
  params,
}: WebhookDeliveriesPageProps) {
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

  if (!permissions.has(PERMISSIONS.WEBHOOKS_DELIVERIES_READ)) {
    notFound();
  }

  const webhook = await findWebhookById(clientId, webhookId);

  if (!webhook) {
    notFound();
  }

  return <WebhookDeliveriesClient clientId={clientId} webhook={webhook} />;
}
