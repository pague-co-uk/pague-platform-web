import { notFound } from "next/navigation";

import CreateConnectorClient from "@/features/connectors/components/create-connector-client";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";


export default async function CreateConnectorPage() {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  const canRead =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_READ,
    );

  const canCreate =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_CREATE,
    );

  if (!canRead || !canCreate) {
    notFound();
  }

  return (
    <CreateConnectorClient />
  );
}