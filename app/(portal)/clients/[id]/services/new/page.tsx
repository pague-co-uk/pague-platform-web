import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findServices,
} from "@/features/services/api/services-server";

import ClientServiceCreateClient from "./client-service-create-client";

interface ClientServiceCreatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientServiceCreatePage({
  params,
}: ClientServiceCreatePageProps) {
  const {
    id: clientId,
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

  const canReadClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_READ,
    );

  const canCreateClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_CREATE,
    );

  if (
    !canReadClientServices ||
    !canCreateClientServices
  ) {
    notFound();
  }

  const services =
    await findServices({
      page: 1,
      pageSize: 100,
      status: "ACTIVE",
    });

  return (
    <ClientServiceCreateClient
      clientId={clientId}
      services={services.items}
    />
  );
}