import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { CreateWebhookClient } from "@/features/webhooks/components/create-webhook-client";

interface CreateWebhookPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function CreateWebhookPage({
  params,
}: CreateWebhookPageProps) {
  const { id: clientId } = await params;

  const authenticatedUser = await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissions = new Set(
    authenticatedUser.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    ),
  );

  if (!permissions.has(PERMISSIONS.WEBHOOKS_CREATE)) {
    notFound();
  }

  if (!permissions.has(PERMISSIONS.CLIENTS_READ)) {
    notFound();
  }

  const client = await findClientById(clientId);

  if (!client) {
    notFound();
  }

  return (
    <CreateWebhookClient
      clientId={client.id}
      clientName={client.displayName || client.companyName}
      clientPublicId={client.publicId}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
