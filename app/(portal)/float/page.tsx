import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import PlatformFloatClient from "@/features/float/components/platform-float-client";

interface PlatformFloatPageProps {
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function PlatformFloatPage({
  searchParams,
}: PlatformFloatPageProps) {
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

  const canReadFloat =
    permissions.has(
      PERMISSIONS.FLOAT_READ,
    );

  if (!canReadFloat) {
    notFound();
  }

  const query =
    await searchParams;

  const page =
    parsePositiveInteger(
      query.page,
    ) ?? 1;

  const pageSize =
    parsePageSize(
      query.pageSize,
    ) ?? 20;

  const clients =
    await findClients({
      page,
      pageSize,
      search:
        query.search?.trim() ||
        undefined,
    });

  return (
    <PlatformFloatClient
      clients={
        clients.items
      }
      pagination={
        clients.meta
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