import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import {
  findTransactionTypes,
} from "@/features/transaction-types/api/transaction-types-server";

import TransactionTypesClient from "@/features/transaction-types/components/transaction-types-client";

interface TransactionTypesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    active?: string;
    sort?: string;
  }>;
}

function getPositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : fallback;
}

export default async function TransactionTypesPage({
  searchParams,
}: TransactionTypesPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissionNames =
    new Set<string>();

  for (const role of authenticatedUser.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(permission.name);
    }
  }

  const canRead =
    permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_READ,
    );

  if (!canRead) {
    notFound();
  }

  const params =
    await searchParams;

  const page =
    getPositiveInteger(params.page, 1);

  const pageSize =
    getPositiveInteger(
      params.pageSize,
      20,
    );

  const search =
    params.search?.trim() || undefined;

  const active =
    params.active === "true"
      ? true
      : params.active === "false"
        ? false
        : undefined;

  const sort =
    params.sort?.trim() || undefined;

  const response =
    await findTransactionTypes({
      page,
      pageSize,
      search,
      active,
      sort,
    });

  const canCreate =
    permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_CREATE,
    );

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_UPDATE,
    );

  const canEnable =
    permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_ENABLE,
    );

  const canDisable =
    permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_DISABLE,
    );

  return (
    <TransactionTypesClient
      initialItems={response.items}
      initialMeta={response.meta}
      permissions={{
        canCreate,
        canUpdate,
        canEnable,
        canDisable,
      }}
    />
  );
}