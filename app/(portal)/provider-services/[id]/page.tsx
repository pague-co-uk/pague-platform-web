import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  ProviderServicesApiError,
  findProviderServiceById,
} from "@/features/provider-services/api/provider-services-server";

import ProviderServiceDetailsClient from "@/features/provider-services/components/provider-service-details-client";

interface ProviderServiceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProviderServiceDetailsPage({
  params,
}: ProviderServiceDetailsPageProps) {
  const {
    id: providerServiceId,
  } = await params;

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

  let providerService;

  try {
    providerService =
      await findProviderServiceById(
        providerServiceId,
      );
  } catch (error) {
    if (
      error instanceof
      ProviderServicesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    console.error(
      "[Provider Service] Unable to load provider service.",
      error,
    );

    providerService = null;
  }

  return (
    <ProviderServiceDetailsClient
      initialProviderService={
        providerService
      }
      canUpdate={canUpdate}
      canEnable={canEnable}
      canDisable={canDisable}
    />
  );
}