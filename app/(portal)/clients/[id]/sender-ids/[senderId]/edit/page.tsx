import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findSenderIdById,
} from "@/features/sender-ids/api/server-sender-ids-api";

import EditSenderIdClient from "@/features/sender-ids/components/edit-sender-id-client";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Edit Sender ID page
// ============================================================================

export default async function EditSenderIdPage({
  params,
}: {
  params: Promise<{
    id: string;
    senderId: string;
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

  const canUpdateSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_UPDATE,
    );

  if (!canUpdateSenderIds) {
    notFound();
  }

  // ==========================================================================
  // Parameters
  // ==========================================================================

  const { id: clientId, senderId } = await params;

  // ==========================================================================
  // Initial data
  // ==========================================================================

  let senderIdData;

  try {
    senderIdData = await findSenderIdById(
      clientId,
      senderId,
    );
  } catch (error) {
    console.error(
      "[Sender IDs] Unable to load Sender ID for editing.",
      error,
    );

    notFound();
  }

  if (!senderIdData) {
    notFound();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <EditSenderIdClient
      senderId={senderIdData}
    />
  );
}