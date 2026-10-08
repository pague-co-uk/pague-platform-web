import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import {
  findTransactionTypeById,
  TransactionTypesApiError,
} from "@/features/transaction-types/api/transaction-types-server";

import TransactionTypeDetailsClient from "@/features/transaction-types/components/transaction-type-details-client";

interface TransactionTypeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionTypeDetailsPage({
  params,
}: TransactionTypeDetailsPageProps) {
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

  const { id } = await params;

  let transactionType;

  try {
    transactionType =
      await findTransactionTypeById(id);
  } catch (error) {
    if (
      error instanceof
      TransactionTypesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

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
    <TransactionTypeDetailsClient
      initialTransactionType={
        transactionType
      }
      permissions={{
        canUpdate,
        canEnable,
        canDisable,
      }}
    />
  );
}