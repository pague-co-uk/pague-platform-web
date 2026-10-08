import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import {
  findTransactionTypeById,
  TransactionTypesApiError,
} from "@/features/transaction-types/api/transaction-types-server";

import TransactionTypeForm from "@/features/transaction-types/components/transaction-type-form";

interface EditTransactionTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTransactionTypePage({
  params,
}: EditTransactionTypePageProps) {
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

  if (
    !permissionNames.has(
      PERMISSIONS.TRANSACTION_TYPES_UPDATE,
    )
  ) {
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

  return (
    <TransactionTypeForm
      mode="edit"
      transactionType={
        transactionType
      }
    />
  );
}