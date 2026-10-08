import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findCountryCurrency } from "@/features/country-currencies/api/country-currencies-server";
import { CountryCurrencyDetailsClient } from "@/features/country-currencies/components/country-currency-details-client";

interface CountryCurrencyDetailsPageProps {
  params: Promise<{
    countryCode: string;
    currencyId: string;
  }>;
}

export default async function CountryCurrencyDetailsPage({
  params,
}: CountryCurrencyDetailsPageProps) {
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

  const canRead =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_READ,
    );

  if (!canRead) {
    notFound();
  }

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_UPDATE,
    );

  const canDelete =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_DELETE,
    );

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
      "[CountryCurrencies] Unable to load country currency.",
      error,
    );

    notFound();
  }

  return (
    <PageContainer>
      <CountryCurrencyDetailsClient
        countryCurrency={countryCurrency}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </PageContainer>
  );
}