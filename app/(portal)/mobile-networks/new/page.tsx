import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";


import { findCountries } from "@/features/mobile-networks/api/server-mobile-networks-api";
import CreateMobileNetworkClient from "@/features/mobile-networks/components/create-mobile-network-client";

// ============================================================================
// New mobile network page
// ============================================================================

export default async function NewMobileNetworkPage() {
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

  const canCreateMobileNetworks =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_CREATE,
    );

  if (
    !canCreateMobileNetworks
  ) {
    notFound();
  }

  // ==========================================================================
  // Reference data
  // ==========================================================================

  const countries =
    await findCountries();

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <CreateMobileNetworkClient
      countries={countries}
    />
  );
}