import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findPaymentProviders,
} from "@/features/payment-providers/api/payment-providers-server";

import {
  findServices,
} from "@/features/services/api/services-server";

import ProviderServiceForm from "@/features/provider-services/components/provider-service-form";

export default async function NewProviderServicePage() {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  const canCreate =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_CREATE,
    );

  if (!canCreate) {
    notFound();
  }

  const [
    providersResponse,
    servicesResponse,
  ] = await Promise.all([
    findPaymentProviders({
      page: 1,
      pageSize: 100,
      status: "ACTIVE",
      sort: "name",
    }),

    findServices({
      page: 1,
      pageSize: 100,
      status: "ACTIVE",
      sort: "name",
    }),
  ]);

  const providers =
    providersResponse.items.map(
      (provider) => ({
        code: provider.code,
        name: provider.name,
      }),
    );

  const services =
    servicesResponse.items.map(
      (service) => ({
        code: service.code,
        name: service.name,
        category: service.category,
      }),
    );

  return (
    <ProviderServiceForm
      mode="create"
      providers={providers}
      services={services}
    />
  );
}