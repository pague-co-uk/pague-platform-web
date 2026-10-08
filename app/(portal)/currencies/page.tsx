import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findCurrencies,
} from "@/features/currencies/api/currencies-server";

import {
  CurrencyListClient,
} from "@/features/currencies/components/currency-list-client";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Currencies page
// ============================================================================

export default async function CurrenciesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    active?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }>;
}) {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Effective permissions
  // ==========================================================================

  const permissionNames =
    new Set<string>();

  for (
    const role of authenticatedUser.roles
  ) {
    for (
      const permission of role.permissions
    ) {
      permissionNames.add(
        permission.name,
      );
    }
  }

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadCurrencies =
    permissionNames.has(
      PERMISSIONS.CURRENCIES_READ,
    );

  if (!canReadCurrencies) {
    notFound();
  }

  const canCreateCurrencies =
    permissionNames.has(
      PERMISSIONS.CURRENCIES_CREATE,
    );

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
    );

  const active =
    parseBoolean(
      params.active,
    );

  const sort =
    buildSortParameter(
      params.sortBy,
      params.sortDirection,
    );

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let currencies;

  try {
    currencies =
      await findCurrencies({
        page,
        pageSize,
        search:
          params.search?.trim() ||
          undefined,
        active,
        sort,
      });
  } catch (error) {
    /*
     * Let the client component display
     * the error state rather than making
     * the entire route unusable.
     */
    console.error(
      "[Currencies] Unable to load currencies.",
      error,
    );

    currencies = null;
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <CurrencyListClient
      initialData={currencies}
      canCreate={
        canCreateCurrencies
      }
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function buildSortParameter(
  sortBy: string | undefined,
  sortDirection:
    | "asc"
    | "desc"
    | undefined,
): string | undefined {
  if (!sortBy) {
    return undefined;
  }

  if (!sortDirection) {
    return sortBy;
  }

  return sortDirection === "desc"
    ? `-${sortBy}`
    : sortBy;
}