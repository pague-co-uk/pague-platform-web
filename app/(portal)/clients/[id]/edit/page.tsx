import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import EditClientClient from "./edit-client-client";

// ============================================================================
// Edit client page
// ============================================================================

export default async function EditClientPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  // ==========================================================================
  // Authentication
  // ==========================================================================

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canUpdateClients =
    authenticatedUser.roles.some(
      (role) =>
        role.permissions.some(
          (permission) =>
            permission.name ===
            "clients.update",
        ),
    );

  if (!canUpdateClients) {
    notFound();
  }

  // ==========================================================================
  // Load client
  // ==========================================================================

  const client =
    await findClientById(id);

  if (!client) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <EditClientClient
      client={client}
    />
  );
}