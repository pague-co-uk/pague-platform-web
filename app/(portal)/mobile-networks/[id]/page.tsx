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
  findMobileNetworkById,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import MobileNetworkDetailsClient from "@/features/mobile-networks/components/mobile-network-details-client";

// ============================================================================
// Mobile Network details page
// ============================================================================

export default async function MobileNetworkDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
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

  const canReadMobileNetworks =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_READ,
    );

  if (!canReadMobileNetworks) {
    notFound();
  }

  const canUpdateMobileNetwork =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_UPDATE,
    );

  const canDeleteMobileNetwork =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_DELETE,
    );

  const canEnableMobileNetwork =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_ENABLE,
    );

  const canDisableMobileNetwork =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_DISABLE,
    );

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const { id } =
    await params;

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let mobileNetwork;

  try {
    mobileNetwork =
      await findMobileNetworkById(
        id,
      );
  } catch (error) {
    console.error(
      "[Mobile Networks] Unable to load mobile network.",
      error,
    );

    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <MobileNetworkDetailsClient
      initialMobileNetwork={
        mobileNetwork
      }
      canUpdateMobileNetwork={
        canUpdateMobileNetwork
      }
      canDeleteMobileNetwork={
        canDeleteMobileNetwork
      }
      canEnableMobileNetwork={
        canEnableMobileNetwork
      }
      canDisableMobileNetwork={
        canDisableMobileNetwork
      }
    />
  );
}