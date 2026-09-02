import { notFound } from "next/navigation";


import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findRoutes,
} from "@/features/routes/api/server-routes-api";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import {
  findMobileNetworks,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import {
  findConnectors,
} from "@/features/connectors/api/server-connectors-api";

import RoutesClient from "@/features/routes/components/routes-client";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface RoutesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    clientId?: string;
    mobileNetworkId?: string;
    connectorId?: string;
    status?: "ACTIVE" | "DISABLED";
  }>;
}

export default async function RoutesPage({
  searchParams,
}: RoutesPageProps) {
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

  const canCreateRoutes = permissionNames.has(
    PERMISSIONS.ROUTES_CREATE,
  );

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

  const params = await searchParams;

  const page = Math.max(
    Number(params.page ?? "1") || 1,
    1,
  );

  const pageSize = Math.min(
    Math.max(
      Number(params.pageSize ?? "20") || 20,
      1,
    ),
    100,
  );

  const status =
    params.status === "ACTIVE" ||
      params.status === "DISABLED"
      ? params.status
      : undefined;

  const [
    routesResult,
    clientsResult,
    mobileNetworksResult,
    connectorsResult,
  ] = await Promise.all([
    findRoutes({
      page,
      pageSize,
      search: params.search,
      clientId: params.clientId,
      mobileNetworkId: params.mobileNetworkId,
      connectorId: params.connectorId,
      status,
    }),

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
    <RoutesClient
      initialRoutes={routesResult.items}
      meta={routesResult.meta}
      clients={clientsResult.items.map(
        (client) => ({
          id: client.id,
          companyName: client.companyName,
          displayName: client.displayName,
        }),
      )}
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
      canCreateRoutes={canCreateRoutes}
      canUpdateRoutes={canUpdateRoutes}
      canDeleteRoutes={canDeleteRoutes}
      canEnableRoutes={canEnableRoutes}
      canDisableRoutes={canDisableRoutes}
    />
  );
}