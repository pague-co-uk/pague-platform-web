import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { findWebhooks } from "@/features/webhooks/api/server-webhooks.api";
import { WebhooksClient } from "@/features/webhooks/components/webhooks-client";

interface ClientWebhooksPageProps {
  readonly params: Promise<{
    id: string;
  }>;
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    enabled?: string;
  }>;
}

export default async function ClientWebhooksPage({
  params,
  searchParams,
}: ClientWebhooksPageProps) {
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

  if (!permissions.has(PERMISSIONS.WEBHOOKS_READ)) {
    notFound();
  }

  const client = await findClientById(clientId);

  if (!client) {
    notFound();
  }

  const canCreateWebhooks = permissions.has(PERMISSIONS.WEBHOOKS_CREATE);

  const query = await searchParams;

  const result = await findWebhooks({
    clientId,
    page: parsePositiveInteger(query.page) ?? 1,
    pageSize: parsePageSize(query.pageSize) ?? 20,
    enabled: parseBoolean(query.enabled),
  });

  const clientOption = {
    id: client.id,
    publicId: client.publicId,
    companyName: client.companyName,
    displayName: client.displayName,
  };

  return (
    <WebhooksClient
      client={clientOption}
      clients={[clientOption]}
      webhooks={result.data}
      pagination={result.pagination}
      canCreateWebhooks={canCreateWebhooks}
    />
  );
}

function parsePositiveInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

function parsePageSize(value: string | undefined): number | undefined {
  const parsed = parsePositiveInteger(value);

  if (parsed === undefined || parsed > 100) {
    return undefined;
  }

  return parsed;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}
