import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findConnectorById,
} from "@/features/connectors/api/server-connectors-api";

import ConnectorDetailsClient from "@/features/connectors/components/connector-details-client";
import { PERMISSIONS } from "@/lib/authorization/permissions";



interface ConnectorDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConnectorDetailsPage({
  params,
}: ConnectorDetailsPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  const permissionNames =
    new Set(
      authenticatedUser!.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  const canRead =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_READ,
    );

  if (!canRead) {
    notFound();
  }

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_UPDATE,
    );

  const canDelete =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_DELETE,
    );

  const canEnable =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_ENABLE,
    );

  const canDisable =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_DISABLE,
    );

  const canSuspend =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_SUSPEND,
    );

  const {
    id,
  } = await params;

  let connector;

  try {
    connector =
      await findConnectorById(
        id,
      );
  } catch (error) {
    console.error(
      "Failed to load connector:",
      error,
    );

    notFound();
  }

  if (!connector) {
    notFound();
  }

  return (
    <ConnectorDetailsClient
      connector={connector}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canEnable={canEnable}
      canDisable={canDisable}
      canSuspend={canSuspend}
    />
  );
}