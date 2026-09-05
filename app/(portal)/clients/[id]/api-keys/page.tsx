import { notFound } from "next/navigation";

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
  findApiKeys,
} from "@/features/api-keys/api/server-api-keys.api";

import ApiKeysClient from "./api-keys-client";

interface ApiKeysPageProps {
  readonly params: Promise<{
    id: string;
  }>;
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
}

const API_KEY_STATUSES = [
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
] as const;

type ApiKeyStatus =
  (typeof API_KEY_STATUSES)[number];

export default async function ApiKeysPage({
  params,
  searchParams,
}: ApiKeysPageProps) {
  const {
    id: clientId,
  } = await params;

  const query =
    await searchParams;

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

  const canReadApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_READ,
    );

  if (!canReadApiKeys) {
    notFound();
  }

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  const canCreateApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_CREATE,
    );

  const canRevokeApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_REVOKE,
    );

  const page =
    parsePositiveInteger(
      query.page,
    ) ?? 1;

  const pageSize =
    parsePageSize(
      query.pageSize,
    ) ?? 20;

  const status =
    parseApiKeyStatus(
      query.status,
    );

  const result =
    await findApiKeys(
      clientId,
      {
        page,
        pageSize,
        status,
      },
    );

  return (
    <ApiKeysClient
      client={client}
      apiKeys={result.data}
      pagination={result.pagination}
      canCreateApiKeys={
        canCreateApiKeys
      }
      canRevokeApiKeys={
        canRevokeApiKeys
      }
    />
  );
}

// ============================================================================
// Query helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed < 1
  ) {
    return undefined;
  }

  return parsed;
}

function parsePageSize(
  value: string | undefined,
): number | undefined {
  const parsed =
    parsePositiveInteger(
      value,
    );

  if (
    parsed === undefined ||
    parsed > 100
  ) {
    return undefined;
  }

  return parsed;
}

function parseApiKeyStatus(
  value: string | undefined,
): ApiKeyStatus | undefined {
  if (!value) {
    return undefined;
  }

  if (
    API_KEY_STATUSES.includes(
      value as ApiKeyStatus,
    )
  ) {
    return value as ApiKeyStatus;
  }

  return undefined;
}