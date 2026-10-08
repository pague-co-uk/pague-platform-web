import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import TransactionTypeForm from "@/features/transaction-types/components/transaction-type-form";

export default async function NewTransactionTypePage() {
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
      PERMISSIONS.TRANSACTION_TYPES_CREATE,
    )
  ) {
    notFound();
  }

  return (
    <TransactionTypeForm mode="create" />
  );
}