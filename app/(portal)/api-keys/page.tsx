
import {
  findPlatformApiKeys,
} from "@/features/api-keys/api/server-api-keys.api";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import PlatformApiKeysClient from "@/features/api-keys/components/platform-api-keys-client";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  notFound,
} from "next/navigation";

// ============================================================================
// Types
// ============================================================================

interface ApiKeysPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    clientId?: string;
    search?: string;
    status?: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function ApiKeysPage({
  searchParams,
}: ApiKeysPageProps) {
  const query =
    await searchParams;

  const user =
    await getCurrentUser();

  const permissions =
    new Set(
      user!.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_READ,
    );

  const canCreateApiKeys =
    permissions.has(
      PERMISSIONS.API_KEYS_CREATE,
    );

  if (!canReadApiKeys) {
    notFound();
  }

  // ==========================================================================
  // Pagination
  // ==========================================================================

  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Number(query.pageSize)
      : 20;

  // ==========================================================================
  // API Keys
  // ==========================================================================

  const apiKeys =
    await findPlatformApiKeys({
      page,
      pageSize,
      clientId:
        query.clientId,
      search:
        query.search,
      status:
        query.status as
        | "ACTIVE"
        | "EXPIRED"
        | "REVOKED"
        | undefined,
    });

  // ==========================================================================
  // Clients
  // ==========================================================================

  const clients =
    canCreateApiKeys
      ? await findClients({
        page: 1,
        pageSize: 100,
      })
      : null;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PlatformApiKeysClient
      apiKeys={
        apiKeys.data
      }
      pagination={
        apiKeys.pagination
      }
      canCreateApiKeys={
        canCreateApiKeys
      }
      clients={
        clients?.items ?? []
      }
    />
  );
}