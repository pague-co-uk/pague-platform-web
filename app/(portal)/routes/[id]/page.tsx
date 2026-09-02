import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findRouteById } from "@/features/routes/api/server-routes-api";

import RouteDetailsClient from "@/features/routes/components/route-details-client";

interface RouteDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RouteDetailsPage({
  params,
}: RouteDetailsPageProps) {
  const authenticatedUser = await getCurrentUser();

  const permissionNames = new Set(
    authenticatedUser!.roles.flatMap((role) =>
      role.permissions.map(
        (permission) => permission.name,
      ),
    ),
  );

  const canReadRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_READ,
  );

  if (!canReadRoutes) {
    notFound();
  }

  const canUpdateRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_UPDATE,
  );

  const canDeleteRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_DELETE,
  );

  const canEnableRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_ENABLE,
  );

  const canDisableRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_DISABLE,
  );

  const { id } = await params;

  try {
    const route = await findRouteById(id);

    return (
      <RouteDetailsClient
        route={route}
        canUpdateRoutes={canUpdateRoutes}
        canDeleteRoutes={canDeleteRoutes}
        canEnableRoutes={canEnableRoutes}
        canDisableRoutes={canDisableRoutes}
      />
    );
  } catch (error) {
    console.error(
      `Failed to load route ${id}:`,
      error,
    );

    notFound();
  }
}