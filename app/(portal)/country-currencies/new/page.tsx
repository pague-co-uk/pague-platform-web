import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { CountryCurrencyCreateClient } from "@/features/country-currencies/components/country-currency-create-client";

import { findCountries } from "@/features/countries/api/countries-server";
import { findCurrencies } from "@/features/currencies/api/currencies-server";

export default async function CountryCurrencyCreatePage() {
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

  const canCreate =
    permissionNames.has(
      PERMISSIONS.COUNTRY_CURRENCIES_CREATE,
    );

  if (!canCreate) {
    notFound();
  }

  const [countries, currencies] =
    await Promise.all([
      findCountries(),
      findCurrencies({
        page: 1,
        pageSize: 100,
        active: true,
        sort: "code",
      }),
    ]);

  return (
    <PageContainer>
      <CountryCurrencyCreateClient
        countries={countries.map(
          (country) => ({
            code: country.code,
            name: country.name,
          }),
        )}
        currencies={currencies.items.map(
          (currency) => ({
            id: currency.id,
            code: currency.code,
            name: currency.name,
          }),
        )}
      />
    </PageContainer>
  );
}