import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import ClientsClient from "./clients-client";

import { PERMISSIONS } from "@/lib/authorization/permissions";

// ============================================================================
// Clients page
// ============================================================================

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }>;
}) {
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
    new Set<string>();

  for (
    const role of authenticatedUser.roles
  ) {
    for (
      const permission of role.permissions
    ) {
      permissionNames.add(
        permission.name,
      );
    }
  }

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadClients =
    permissionNames.has(
      PERMISSIONS.CLIENTS_READ,
    );

  if (!canReadClients) {
    notFound();
  }

  const canCreateClients =
    permissionNames.has(
      PERMISSIONS.CLIENTS_CREATE,
    );

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const params =
    await searchParams;

  const page =
    parsePositiveInteger(
      params.page,
      1,
    );

  const pageSize =
    parsePositiveInteger(
      params.pageSize,
      20,
    );

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let clients;

  try {
    clients =
      await findClients({
        page,
        pageSize,
        search:
          params.search?.trim() ||
          undefined,
      });
  } catch (error) {
    /*
     * Let the client component display the error state rather than making
     * the entire route unusable.
     */
    console.error(
      "[Clients] Unable to load clients.",
      error,
    );

    clients = null;
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <ClientsClient
      initialClients={
        clients
      }
      canCreateClients={
        canCreateClients
      }
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}