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
  findMobileNetworkPrefixById,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import EditMobileNetworkPrefixClient from "@/features/mobile-networks/components/edit-mobile-network-prefix-client";

// ============================================================================
// Edit Mobile Network prefix page
// ============================================================================

export default async function EditMobileNetworkPrefixPage({
  params,
}: {
  params: Promise<{
    id: string;
    prefixId: string;
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

  const canUpdatePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_UPDATE,
    );

  if (!canUpdatePrefixes) {
    notFound();
  }

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const {
    id,
    prefixId,
  } = await params;

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let mobileNetwork;
  let prefix;

  try {
    [
      mobileNetwork,
      prefix,
    ] = await Promise.all([
      findMobileNetworkById(
        id,
      ),
      findMobileNetworkPrefixById(
        id,
        prefixId,
      ),
    ]);
  } catch (error) {
    console.error(
      "[Edit Mobile Network Prefix] Unable to load prefix.",
      error,
    );

    notFound();
  }

  if (
    !mobileNetwork ||
    !prefix
  ) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <EditMobileNetworkPrefixClient
      mobileNetworkId={
        mobileNetwork.id
      }
      mobileNetworkName={
        mobileNetwork.name
      }
      prefix={
        prefix
      }
    />
  );
}