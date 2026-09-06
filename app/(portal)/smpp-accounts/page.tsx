import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findPlatformSmppAccounts,
} from "@/features/smpp-accounts/api/server-smpp-accounts-api";

import PlatformSmppAccountsClient from "@/features/smpp-accounts/components/platform-smpp-accounts-client";

interface PlatformSmppAccountsPageProps {
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    clientId?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function PlatformSmppAccountsPage({
  searchParams,
}: PlatformSmppAccountsPageProps) {
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

  const canReadSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_READ,
    );

  if (!canReadSmppAccounts) {
    notFound();
  }

  const params = await searchParams;

  const page =
    Number(params.page) > 0
      ? Number(params.page)
      : 1;

  const pageSize =
    Number(params.pageSize) > 0
      ? Number(params.pageSize)
      : 20;

  const result =
    await findPlatformSmppAccounts({
      page,
      pageSize,
      clientId:
        params.clientId ||
        undefined,
      status:
        params.status === "ACTIVE" ||
          params.status === "DISABLED" ||
          params.status === "SUSPENDED"
          ? params.status
          : undefined,
      search:
        params.search?.trim() ||
        undefined,
    });

  return (
    <PlatformSmppAccountsClient
      smppAccounts={result.data}
      pagination={result.pagination}
    />
  );
}