import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findSenderIds,
} from "@/features/sender-ids/api/server-sender-ids-api";


import SenderIdsClient from "@/features/sender-ids/components/sender-ids-client";
import { PERMISSIONS } from "@/lib/authorization/permissions";

// ============================================================================
// Sender IDs page
// ============================================================================

export default async function SenderIdsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sender?: string;
    clientId?: string;
    isDefault?: string;
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

  const canReadSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_READ,
    );

  if (!canReadSenderIds) {
    notFound();
  }

  const canCreateSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_CREATE,
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
    isSenderIdStatus(
      params.status,
    )
      ? params.status
      : undefined;

  const isDefault =
    parseBoolean(
      params.isDefault,
    );

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let senderIds;

  try {
    senderIds =
      await findSenderIds({
        page,
        pageSize,
        search:
          params.search?.trim() ||
          undefined,
        status,
        sender:
          params.sender?.trim() ||
          undefined,
        clientId:
          params.clientId ||
          undefined,
        isDefault,
      });
  } catch (error) {
    /*
     * Let the client component display the error state rather than making
     * the entire route unusable.
     */
    console.error(
      "[Sender IDs] Unable to load Sender IDs.",
      error,
    );

    senderIds = null;
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <SenderIdsClient
      initialSenderIds={
        senderIds
      }
      canCreateSenderIds={
        canCreateSenderIds
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

function parseBoolean(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function isSenderIdStatus(
  value: string | undefined,
): value is
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DISABLED" {
  return (
    value === "PENDING" ||
    value === "APPROVED" ||
    value === "REJECTED" ||
    value === "DISABLED"
  );
}