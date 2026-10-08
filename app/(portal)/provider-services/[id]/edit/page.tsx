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

import ProviderServiceForm from "@/features/provider-services/components/provider-service-form";

interface EditProviderServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProviderServicePage({
  params,
}: EditProviderServicePageProps) {
  const {
    id,
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

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.PROVIDER_SERVICES_UPDATE,
    );

  if (!canUpdate) {
    notFound();
  }

  let providerService;

  try {
    providerService =
      await findProviderServiceById(id);
  } catch (error) {
    if (
      error instanceof
      ProviderServicesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <ProviderServiceForm
      mode="edit"
      providerService={
        providerService
      }
    />
  );
}