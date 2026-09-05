import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import MessagesBulkClient from "./MessagesBulkClient";

interface MessagesBulkPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function MessagesBulkPage({
  params,
}: MessagesBulkPageProps) {

  const {
    id: clientId,
  } = await params;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Permissions
  // ==========================================================================

  const permissions =
    new Set(
      authenticatedUser.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  const canCreateMessages =
    permissions.has(
      PERMISSIONS.MESSAGES_CREATE,
    );

  if (!canCreateMessages) {
    notFound();
  }

  // ==========================================================================
  // Client
  // ==========================================================================

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  // ==========================================================================

  return (
    <MessagesBulkClient
      client={client}
      canCreateMessages={
        canCreateMessages
      }
    />
  );
}
