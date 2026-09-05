import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findApiKey,
} from "@/features/api-keys/api/server-api-keys.api";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import ApiKeyDetailsClient from "./api-key-details-client";

interface PageProps {
  params: Promise<{
    id: string;
    keyId: string;
  }>;
}

export default async function ApiKeyDetailsPage({
  params,
}: PageProps) {
  const {
    id: clientId,
    keyId,
  } = await params;

  const user =
    await getCurrentUser();

  if (!user) {
    notFound();
  }

  const permissions =
    new Set(
      user.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  const canRead =
    permissions.has(
      PERMISSIONS.API_KEYS_READ,
    );

  if (!canRead) {
    notFound();
  }

  const [
    client,
    apiKey,
  ] = await Promise.all([
    findClientById(clientId),
    findApiKey(
      clientId,
      keyId,
    ),
  ]);

  if (!client || !apiKey) {
    notFound();
  }

  return (
    <ApiKeyDetailsClient
      client={client}
      apiKey={apiKey}
      canRevoke={permissions.has(
        PERMISSIONS.API_KEYS_REVOKE,
      )}
    />
  );
}