import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findProviderServices,
} from "@/features/provider-services/api/provider-services-server";

import ProviderServicesClient from "@/features/provider-services/components/provider-services-client";

interface ProviderServicesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    active?: string;
    providerCode?: string;
    serviceCode?: string;
    sort?: string;
  }>;
}

export default async function ProviderServicesPage({
  searchParams,
}: ProviderServicesPageProps) {
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

  const canRead =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_READ,
    );

  if (!canRead) {
    notFound();
  }

  const canCreate =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_CREATE,
    );

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_UPDATE,
    );

  const canEnable =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_ENABLE,
    );

  const canDisable =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_DISABLE,
    );

  const queryParams =
    await searchParams;

  const page = Math.max(
    Number(
      queryParams.page ?? "1",
    ) || 1,
    1,
  );

  const pageSize = Math.min(
    Math.max(
      Number(
        queryParams.pageSize ?? "20",
      ) || 20,
      1,
    ),
    100,
  );

  const active =
    queryParams.active === "true"
      ? true
      : queryParams.active === "false"
        ? false
        : undefined;

  const providerServices =
    await findProviderServices({
      page,
      pageSize,
      search:
        queryParams.search ||
        undefined,
      active,
      providerCode:
        queryParams.providerCode ||
        undefined,
      serviceCode:
        queryParams.serviceCode ||
        undefined,
      sort:
        queryParams.sort ||
        undefined,
    });

  return (
    <ProviderServicesClient
      initialProviderServices={
        providerServices.items
      }
      meta={
        providerServices.meta
      }
      canCreate={canCreate}
      canUpdate={canUpdate}
      canEnable={canEnable}
      canDisable={canDisable}
    />
  );
}