import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findCountryCurrencies } from "@/features/country-currencies/api/country-currencies-server";
import { CountryCurrencyListClient } from "@/features/country-currencies/components/country-currency-list-client";

interface CountryCurrenciesPageProps {
  searchParams: Promise<{
    search?: string;
    countryCode?: string;
    currencyId?: string;
    isPrimary?: string;
    isOfficial?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }>;
}

export default async function CountryCurrenciesPage({
  searchParams,
}: CountryCurrenciesPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissionNames = new Set<string>();

  for (const role of authenticatedUser.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(permission.name);
    }
  }

  const canReadCountryCurrencies =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_READ,
    );

  if (!canReadCountryCurrencies) {
    notFound();
  }

  const canCreateCountryCurrencies =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_CREATE,
    );

  const params = await searchParams;

  const page = parsePositiveInteger(
    params.page,
    1,
  );

  const pageSize = parsePositiveInteger(
    params.pageSize,
    20,
  );

  const isPrimary = parseBoolean(
    params.isPrimary,
  );

  const isOfficial = parseBoolean(
    params.isOfficial,
  );

  const sort = buildSortParameter(
    params.sortBy,
    params.sortDirection,
  );

  let countryCurrencies;

  try {
    countryCurrencies =
      await findCountryCurrencies({
        page,
        pageSize,
        countryCode:
          params.countryCode?.trim() ||
          undefined,
        currencyId:
          params.currencyId?.trim() ||
          undefined,
        isPrimary,
        isOfficial,
        search:
          params.search?.trim() ||
          undefined,
        sort,
      });
  } catch (error) {
    console.error(
      "[CountryCurrencies] Unable to load country currencies.",
      error,
    );

    countryCurrencies = null;
  }

  return (
    <CountryCurrencyListClient
      initialData={countryCurrencies}
      canCreate={
        canCreateCountryCurrencies
      }
    />
  );
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

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