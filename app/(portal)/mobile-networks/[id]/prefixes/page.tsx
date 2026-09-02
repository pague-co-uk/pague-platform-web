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
  findMobileNetworkPrefixes,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import MobileNetworkPrefixesClient from "@/features/mobile-networks/components/mobile-network-prefixes-client";

// ============================================================================
// Mobile Network prefixes page
// ============================================================================

export default async function MobileNetworkPrefixesPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    page?: string;
    pageSize?: string;
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

  const canUpdatePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_UPDATE,
    );

  const canDeletePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_DELETE,
    );

  const canEnablePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_ENABLE,
    );

  const canDisablePrefixes =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_DISABLE,
    );

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const {
    id,
  } = await params;

  const query =
    await searchParams;

  const page =
    parsePositiveInteger(
      query.page,
      1,
    );

  const pageSize =
    parsePositiveInteger(
      query.pageSize,
      20,
    );

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let mobileNetwork;
  let prefixes;

  try {
    [
      mobileNetwork,
      prefixes,
    ] = await Promise.all([
      findMobileNetworkById(
        id,
      ),
      findMobileNetworkPrefixes(
        id,
        {
          page,
          pageSize,
        },
      ),
    ]);
  } catch (error) {
    console.error(
      "[Mobile Network Prefixes] Unable to load prefixes.",
      error,
    );

    prefixes = null;

    /*
     * We still need the network name when rendering the error state.
     * If the network itself cannot be loaded, the resource does not exist
     * from the perspective of this page.
     */
    if (!mobileNetwork) {
      notFound();
    }
  }

  if (!mobileNetwork) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <MobileNetworkPrefixesClient
      mobileNetworkId={
        mobileNetwork.id
      }
      mobileNetworkName={
        mobileNetwork.name
      }
      initialPrefixes={
        prefixes
      }
      canCreatePrefixes={
        canCreatePrefixes
      }
      canUpdatePrefixes={
        canUpdatePrefixes
      }
      canDeletePrefixes={
        canDeletePrefixes
      }
      canEnablePrefixes={
        canEnablePrefixes
      }
      canDisablePrefixes={
        canDisablePrefixes
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