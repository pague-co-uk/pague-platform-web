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
import CreateMobileNetworkPrefixClient from "@/features/mobile-networks/components/create-mobile-network-prefix-client";


// ============================================================================
// Create Mobile Network prefix page
// ============================================================================

export default async function NewMobileNetworkPrefixPage({
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

  const canCreatePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_CREATE,
    );

  if (!canCreatePrefixes) {
    notFound();
  }

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const {
    id,
  } = await params;

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
      "[Create Mobile Network Prefix] Unable to load mobile network.",
      error,
    );

    notFound();
  }

  if (!mobileNetwork) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <CreateMobileNetworkPrefixClient
      mobileNetworkId={
        mobileNetwork.id
      }
      mobileNetworkName={
        mobileNetwork.name
      }
      defaultCountryCode={
        mobileNetwork.countryCode
      }
    />
  );
}