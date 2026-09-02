import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findClients } from "@/features/clients/api/server-clients-api";
import { findConnectors } from "@/features/connectors/api/server-connectors-api";
import { findMobileNetworks } from "@/features/mobile-networks/api/server-mobile-networks-api";
import { findRouteById } from "@/features/routes/api/server-routes-api";

import EditRouteClient from "@/features/routes/components/edit-route-client";

interface EditRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRoutePage({
  params,
}: EditRoutePageProps) {
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

  const canUpdateRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_UPDATE,
  );

  if (!canReadRoutes || !canUpdateRoutes) {
    notFound();
  }

  const { id } = await params;

  try {
    const [
      route,
      clientsResult,
      mobileNetworksResult,
      connectorsResult,
    ] = await Promise.all([
      findRouteById(id),

      findClients({
        page: 1,
        pageSize: 100,
      }),

      findMobileNetworks({
        page: 1,
        pageSize: 100,
      }),

      findConnectors({
        page: 1,
        pageSize: 100,
      }),
    ]);

    return (
      <EditRouteClient
        route={route}
        clients={clientsResult.items.map((client) => ({
          id: client.id,
          companyName: client.companyName,
          displayName: client.displayName,
        }))}
        mobileNetworks={mobileNetworksResult.items.map(
          (network) => ({
            id: network.id,
            name: network.name,
            code: network.code,
            countryCode: network.countryCode,
          }),
        )}
        connectors={connectorsResult.items.map(
          (connector) => ({
            id: connector.id,
            name: connector.name,
            code: connector.code,
            provider: connector.provider,
            transport: connector.transport,
          }),
        )}
      />
    );
  } catch (error) {
    console.error(
      `Failed to load route ${id} for editing:`,
      error,
    );

    notFound();
  }
}