import { notFound } from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findTransactions,
} from "@/features/transactions/api/transactions-server-api";

import {
  TransactionsTable,
} from "@/features/transactions/components/transactions-table";

import {
  TransactionFilters,
} from "@/features/transactions/components/transaction-filters";

import {
  TRANSACTION_STATUSES,
  type TransactionStatus,
} from "@/features/transactions/types/transaction";

interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    sort?: string;
  }>;
}

// ============================================================================
// Query parsing
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  max?: number,
): number {
  if (
    !value ||
    !/^\d+$/.test(value)
  ) {
    return fallback;
  }

  const parsed =
    parseInt(value, 10);

  if (parsed < 1) {
    return fallback;
  }

  if (
    max !== undefined &&
    parsed > max
  ) {
    return fallback;
  }

  return parsed;
}

function parseTransactionStatus(
  value: string | undefined,
): TransactionStatus | undefined {
  if (!value) {
    return undefined;
  }

  const statuses =
    Object.values(
      TRANSACTION_STATUSES,
    ) as readonly string[];

  if (!statuses.includes(value)) {
    return undefined;
  }

  return value as TransactionStatus;
}

// ============================================================================
// Page
// ============================================================================

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
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
  // Query parameters
  // ==========================================================================

  const params =
    await searchParams;

  const page =
    parsePositiveInteger(
      params.page,
      1,
    );

  const pageSize =
    parsePositiveInteger(
      params.pageSize,
      20,
      100,
    );

  const status =
    parseTransactionStatus(
      params.status,
    );

  // ==========================================================================
  // Data
  // ==========================================================================

  const transactionResponse =
    await findTransactions({
      page,
      pageSize,
      search:
        params.search,
      status,
      sort:
        params.sort,
    });

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="View and monitor payment transactions processed through the platform."
      />

      <div className="mt-6 space-y-6">
        <TransactionFilters
          search={
            params.search
          }
          status={
            params.status
          }
        />

        <TransactionsTable
          transactions={
            transactionResponse.items
          }
          meta={
            transactionResponse.meta
          }
        />
      </div>
    </PageContainer>
  );
}