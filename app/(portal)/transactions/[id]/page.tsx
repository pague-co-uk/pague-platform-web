import { notFound } from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findTransactionById,
} from "@/features/transactions/api/transactions-server-api";

import {
  TransactionDetails,
} from "@/features/transactions/components/transaction-details";

interface TransactionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailsPage({
  params,
}: TransactionDetailsPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Permissions
  // ==========================================================================

  const permissionNames =
    new Set<string>();

  for (const role of authenticatedUser.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(
        permission.name,
      );
    }
  }

  const canRead =
    permissionNames.has(
      PERMISSIONS.PAYMENTS_READ,
    );

  if (!canRead) {
    notFound();
  }

  // ==========================================================================
  // Transaction
  // ==========================================================================

  const { id } =
    await params;

  if (!id) {
    notFound();
  }

  let transaction;

  try {
    transaction =
      await findTransactionById(id);
  } catch {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <TransactionDetails
        transaction={
          transaction
        }
      />
    </PageContainer>
  );
}