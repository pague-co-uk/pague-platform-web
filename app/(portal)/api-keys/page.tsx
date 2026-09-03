import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findApiKeys } from "@/features/api-keys/api/server-api-keys.api";
import { ApiKeysClient } from "@/features/api-keys/components/api-keys-client";
import { findClients } from "@/features/clients/api/server-clients-api";

interface ApiKeysPageProps {
  searchParams: Promise<{
    clientId?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
}

type ApiKeyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";

export default async function ApiKeysPage({
  searchParams,
}: ApiKeysPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  const canReadApiKeys =
    permissionNames.has(
      PERMISSIONS.API_KEYS_READ,
    );

  const canCreateApiKeys =
    permissionNames.has(
      PERMISSIONS.API_KEYS_CREATE,
    );

  const canRevokeApiKeys =
    permissionNames.has(
      PERMISSIONS.API_KEYS_REVOKE,
    );

  if (!canReadApiKeys) {
    notFound();
  }

  const queryParams =
    await searchParams;

  const clientId =
    queryParams.clientId?.trim() ?? "";

  const parsedPage =
    Number(queryParams.page);

  const page =
    Number.isInteger(parsedPage) &&
      parsedPage >= 1
      ? parsedPage
      : 1;

  const parsedPageSize =
    Number(queryParams.pageSize);

  const pageSize =
    Number.isInteger(parsedPageSize) &&
      parsedPageSize >= 1 &&
      parsedPageSize <= 100
      ? parsedPageSize
      : 20;

  let status:
    | ApiKeyStatus
    | undefined;

  if (
    queryParams.status === "ACTIVE"
  ) {
    status = "ACTIVE";
  } else if (
    queryParams.status === "EXPIRED"
  ) {
    status = "EXPIRED";
  } else if (
    queryParams.status === "REVOKED"
  ) {
    status = "REVOKED";
  }

  let clients;

  try {
    clients = await findClients({
      page: 1,
      pageSize: 100,
    });
  } catch (error) {
    console.error(
      "[ApiKeys] Unable to load clients.",
      error,
    );

    notFound();
  }

  let apiKeys = null;

  if (clientId) {
    try {
      apiKeys =
        await findApiKeys(
          clientId,
          {
            page,
            pageSize,
            status,
          },
        );
    } catch (error) {
      console.error(
        "[ApiKeys] Unable to load API keys.",
        error,
      );

      notFound();
    }
  }

  return (
    <ApiKeysClient
      clients={clients.items.map(
        (client) => ({
          id: client.id,
          publicId:
            client.publicId,
          companyName:
            client.companyName,
          displayName:
            client.displayName,
        }),
      )}
      apiKeys={
        apiKeys?.data ?? []
      }
      pagination={
        apiKeys?.pagination ?? null
      }
      canCreateApiKeys={
        canCreateApiKeys
      }
      canRevokeApiKeys={
        canRevokeApiKeys
      }
    />
  );
}