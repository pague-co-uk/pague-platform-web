import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findCountryCurrency } from "@/features/country-currencies/api/country-currencies-server";
import { CountryCurrencyEditClient } from "@/features/country-currencies/components/country-currency-edit-client";

interface CountryCurrencyEditPageProps {
  params: Promise<{
    countryCode: string;
    currencyId: string;
  }>;
}

export default async function CountryCurrencyEditPage({
  params,
}: CountryCurrencyEditPageProps) {
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

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_UPDATE,
    );

  if (!canUpdate) {
    notFound();
  }

  const {
    countryCode,
    currencyId,
  } = await params;

  let countryCurrency;

  try {
    countryCurrency =
      await findCountryCurrency(
        countryCode,
        currencyId,
      );
  } catch (error) {
    console.error(
      "[CountryCurrencies] Unable to load country currency for editing.",
      error,
    );

    notFound();
  }

  return (
    <PageContainer>
      <CountryCurrencyEditClient
        countryCurrency={countryCurrency}
      />
    </PageContainer>
  );
}