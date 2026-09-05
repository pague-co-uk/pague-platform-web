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
  findClientById,
} from "@/features/clients/api/server-clients-api";

import CreateApiKeyClient from "./create-api-key-client";

interface CreateApiKeyPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function CreateApiKeyPage({
  params,
}: CreateApiKeyPageProps) {
  const {
    id: clientId,
  } = await params;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  if (
    !permissions.has(
      PERMISSIONS.API_KEYS_CREATE,
    )
  ) {
    notFound();
  }

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  return (
    <CreateApiKeyClient
      client={client}
    />
  );
}