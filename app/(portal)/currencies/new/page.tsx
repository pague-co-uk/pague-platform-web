import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { CurrencyCreateClient } from "@/features/currencies/components/currency-create-client";

export default async function CreateCurrencyPage() {
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

  const canCreateCurrencies = permissionNames.has(
    PERMISSIONS.CURRENCIES_CREATE,
  );

  if (!canCreateCurrencies) {
    notFound();
  }

  return <CurrencyCreateClient />;
}