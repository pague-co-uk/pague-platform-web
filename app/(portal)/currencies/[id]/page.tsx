import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findCurrencyById,
} from "@/features/currencies/api/currencies-server";

import {
  CurrencyDetailsClient,
} from "@/features/currencies/components/currency-details-client";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Currency details page
// ============================================================================

export default async function CurrencyDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
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

  const canUpdateCurrencies =
    permissionNames.has(
      PERMISSIONS.CURRENCIES_UPDATE,
    );

  const canEnableCurrencies =
    permissionNames.has(
      PERMISSIONS.CURRENCIES_ENABLE,
    );

  const canDisableCurrencies =
    permissionNames.has(
      PERMISSIONS.CURRENCIES_DISABLE,
    );

  // ==========================================================================
  // Route parameters
  // ==========================================================================

  const { id } = await params;

  // ==========================================================================
  // Currency
  // ==========================================================================

  let currency;

  try {
    currency =
      await findCurrencyById(id);
  } catch (error) {
    console.error(
      `[Currencies] Unable to load currency ${id}.`,
      error,
    );

    notFound();
  }

  if (!currency) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <CurrencyDetailsClient
      currency={currency}
      canUpdate={
        canUpdateCurrencies
      }
      canEnable={
        canEnableCurrencies
      }
      canDisable={
        canDisableCurrencies
      }
    />
  );
}