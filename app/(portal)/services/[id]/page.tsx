import { notFound } from "next/navigation";

import { findServiceById } from "@/features/services/api/services-server";
import ServiceDetailsClient from "@/features/services/components/service-details-client";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

interface ServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServicePage({
  params,
}: ServicePageProps) {
  const authenticatedUser = await getCurrentUser();

  const permissionNames = new Set(
    authenticatedUser!.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    ),
  );

  const canReadServices = permissionNames.has(
    PERMISSIONS.SERVICES_READ,
  );

  if (!canReadServices) {
    notFound();
  }

  const canUpdateServices = permissionNames.has(
    PERMISSIONS.SERVICES_UPDATE,
  );

  const canEnableServices = permissionNames.has(
    PERMISSIONS.SERVICES_ENABLE,
  );

  const canDisableServices = permissionNames.has(
    PERMISSIONS.SERVICES_DISABLE,
  );

  const { id } = await params;

  let service;

  try {
    service = await findServiceById(id);
  } catch {
    notFound();
  }

  if (!service) {
    notFound();
  }

  return (
    <ServiceDetailsClient
      service={service}
      canUpdateServices={canUpdateServices}
      canEnableServices={canEnableServices}
      canDisableServices={canDisableServices}
    />
  );
}