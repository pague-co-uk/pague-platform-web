import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findCurrencyById } from "@/features/currencies/api/currencies-server";
import { CurrencyEditClient } from "@/features/currencies/components/currency-edit-client";

interface CurrencyEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CurrencyEditPage({
  params,
}: CurrencyEditPageProps) {
  const authenticatedUser = await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissionNames = new Set<string>();

  for (const role of authenticatedUser.roles) {
    for (const permission of role.permissions) {
      permissionNames.add(permission.name);
    }
  }

  const canUpdateCurrencies = permissionNames.has(
    PERMISSIONS.CURRENCIES_UPDATE,
  );

  if (!canUpdateCurrencies) {
    notFound();
  }

  const { id } = await params;

  let currency;

  try {
    currency = await findCurrencyById(id);
  } catch (error) {
    console.error(
      "[CurrencyEditPage] Unable to load currency.",
      error,
    );

    notFound();
  }

  if (!currency) {
    notFound();
  }

  return <CurrencyEditClient currency={currency} />;
}