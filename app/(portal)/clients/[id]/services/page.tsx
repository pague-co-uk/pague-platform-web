import { notFound } from "next/navigation";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClientServices,
} from "@/features/client-services/api/client-services-server";

import ClientServicesClient from "@/features/client-services/components/client-services-client";
import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";


interface ClientServicesPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: "ACTIVE" | "DISABLED";
    sort?: string;
  }>;
}

export default async function ClientServicesPage({
  params: routeParams,
  searchParams,
}: ClientServicesPageProps) {
  // ==========================================================================
  // Route parameters
  // ==========================================================================

  const {
    id: clientId,
  } = await routeParams;

  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Effective permissions
  // ==========================================================================

  const permissionNames =
    new Set(
      authenticatedUser.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_READ,
    );

  if (!canReadClientServices) {
    notFound();
  }

  const canCreateClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_CREATE,
    );

  const canUpdateClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_UPDATE,
    );

  const canEnableClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_ENABLE,
    );

  const canDisableClientServices =
    permissionNames.has(
      PERMISSIONS.CLIENT_SERVICES_DISABLE,
    );

  // ==========================================================================
  // Query parameters
  // ==========================================================================

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

  const status =
    queryParams.status === "ACTIVE" ||
      queryParams.status === "DISABLED"
      ? queryParams.status
      : undefined;

  // ==========================================================================
  // Initial data
  // ==========================================================================

  const clientServices =
    await findClientServices(
      clientId,
      {
        page,
        pageSize,
        search:
          queryParams.search ||
          undefined,
        status,
        sort:
          queryParams.sort ||
          undefined,
      },
    );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <ClientServicesClient
      clientId={clientId}
      initialClientServices={
        clientServices.items
      }
      meta={
        clientServices.meta
      }
      canCreate={
        canCreateClientServices
      }
      canUpdate={
        canUpdateClientServices
      }
      canEnable={
        canEnableClientServices
      }
      canDisable={
        canDisableClientServices
      }
    />
  );
}