import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findMobileNetworks,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import MobileNetworksClient from "@/features/mobile-networks/components/mobile-networks-client";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Mobile Networks page
// ============================================================================

export default async function MobileNetworksPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    countryCode?: string;
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

  const canCreateMobileNetworks =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_CREATE,
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

  const status =
    isMobileNetworkStatus(
      params.status,
    )
      ? params.status
      : undefined;

  const countryCode =
    params.countryCode
      ?.trim()
      .toUpperCase() ||
    undefined;

  const search =
    params.search?.trim() ||
    undefined;

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let mobileNetworks;

  try {
    mobileNetworks =
      await findMobileNetworks({
        page,
        pageSize,
        search,
        status,
        countryCode,
      });
  } catch (error) {
    /*
     * Let the client component display the error state rather than making
     * the entire route unusable.
     */
    console.error(
      "[Mobile Networks] Unable to load mobile networks.",
      error,
    );

    mobileNetworks = null;
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <MobileNetworksClient
      initialMobileNetworks={
        mobileNetworks
      }
      canCreateMobileNetworks={
        canCreateMobileNetworks
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

function isMobileNetworkStatus(
  value: string | undefined,
): value is
  | "ACTIVE"
  | "DISABLED" {
  return (
    value === "ACTIVE" ||
    value === "DISABLED"
  );
}