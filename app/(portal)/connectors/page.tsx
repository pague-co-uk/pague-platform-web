import { notFound } from "next/navigation";

import ConnectorsClient from "@/features/connectors/components/connectors-client";

import {
  findConnectors,
  ServerConnectorsApiError,
} from "@/features/connectors/api/server-connectors-api";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";


interface ConnectorsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    transport?: string;
    provider?: string;
    search?: string;
  }>;
}

export default async function ConnectorsPage({
  searchParams,
}: ConnectorsPageProps) {
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

  if (!canRead) {
    notFound();
  }

  const canCreate =
    permissionNames.has(
      PERMISSIONS.CONNECTORS_CREATE,
    );

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

  const params =
    await searchParams;

  const page = params.page
    ? Number(params.page)
    : 1;

  const pageSize =
    params.pageSize
      ? Number(params.pageSize)
      : 20;

  let result;

  try {
    result =
      await findConnectors({
        page,
        pageSize,
        status:
          params.status as
          | "ACTIVE"
          | "DISABLED"
          | "SUSPENDED"
          | undefined,
        transport:
          params.transport as
          | "SMPP"
          | "HTTP"
          | undefined,
        provider:
          params.provider,
        search:
          params.search,
      });
  } catch (error) {
    if (
      error instanceof
      ServerConnectorsApiError &&
      error.status === 403
    ) {
      notFound();
    }

    console.error(
      "Failed to load connectors",
      error,
    );

    throw error;
  }

  return (
    <ConnectorsClient
      initialConnectors={
        result.items
      }
      meta={result.meta}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canEnable={canEnable}
      canDisable={canDisable}
      canSuspend={canSuspend}
    />
  );
}