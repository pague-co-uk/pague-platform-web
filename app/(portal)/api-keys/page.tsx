import { PageContainer } from "@/components/layout/page-container";
import { findPlatformApiKeys } from "@/features/api-keys/api/server-api-keys.api";

import PlatformApiKeysClient from "@/features/api-keys/components/platform-api-keys-client";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

interface ApiKeysPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    clientId?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function ApiKeysPage({
  searchParams,
}: ApiKeysPageProps) {
  const query =
    await searchParams;

  const user =
    await getCurrentUser();

  const canReadApiKeys =
    user?.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.API_KEYS_READ,
        ),
    ) ?? false;

  if (!canReadApiKeys) {
    return (
      <PageContainer>
        Access denied.
      </PageContainer>
    );
  }

  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Number(query.pageSize)
      : 20;

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

  return (
    <PlatformApiKeysClient
      apiKeys={apiKeys.data}
      pagination={
        apiKeys.pagination
      }
    />
  );
}