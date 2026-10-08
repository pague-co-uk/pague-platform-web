import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  ClientServicesApiError,
  findClientServiceById,
} from "@/features/client-services/api/client-services-server";
import ClientServiceEditClient from "./client-service-edit-client";


interface ClientServiceEditPageProps {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
}

export default async function ClientServiceEditPage({
  params,
}: ClientServiceEditPageProps) {
  const {
    id: clientId,
    serviceId,
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

  const canUpdateClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_UPDATE,
    );

  if (
    !canReadClientServices ||
    !canUpdateClientServices
  ) {
    notFound();
  }

  let clientService;

  try {
    clientService =
      await findClientServiceById(
        clientId,
        serviceId,
      );
  } catch (error) {
    if (
      error instanceof
      ClientServicesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    console.error(
      "[Client Service] Unable to load client service for editing.",
      error,
    );

    notFound();
  }

  return (
    <ClientServiceEditClient
      clientId={clientId}
      initialClientService={
        clientService
      }
    />
  );
}