import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findConnectorById,
} from "@/features/connectors/api/server-connectors-api";

import EditConnectorClient from "@/features/connectors/components/edit-connector-client";

interface EditConnectorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditConnectorPage({
  params,
}: EditConnectorPageProps) {
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

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_UPDATE,
    );

  if (!canRead || !canUpdate) {
    notFound();
  }

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
    <EditConnectorClient
      connector={connector}
    />
  );
}