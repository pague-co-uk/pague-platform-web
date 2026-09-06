import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findSenderIdById } from "@/features/sender-ids/api/server-sender-ids-api";
import SenderIdDetailsClient from "@/features/sender-ids/components/sender-id-details-client";

interface SenderIdPageProps {
  params: Promise<{
    id: string;
    senderId: string;
  }>;
}

export default async function SenderIdPage({
  params,
}: SenderIdPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  const canReadSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_READ,
    );

  if (!canReadSenderIds) {
    notFound();
  }

  const canUpdateSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_UPDATE,
    );

  const canDeleteSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_DELETE,
    );

  const canApproveSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_APPROVE,
    );

  const canRejectSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_REJECT,
    );

  const canDisableSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_DISABLE,
    );

  const canEnableSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_ENABLE,
    );

  const canDefaultUpdateSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_DEFAULT_UPDATE,
    );

  const {
    id: clientId,
    senderId: senderIdId,
  } = await params;

  let senderId;

  try {
    senderId =
      await findSenderIdById(
        clientId,
        senderIdId,
      );
  } catch (error) {
    console.error(
      "[Sender ID] Unable to load Sender ID.",
      error,
    );

    notFound();
  }

  return (
    <SenderIdDetailsClient
      senderId={senderId}
      canUpdateSenderIds={
        canUpdateSenderIds
      }
      canDeleteSenderIds={
        canDeleteSenderIds
      }
      canApproveSenderIds={
        canApproveSenderIds
      }
      canRejectSenderIds={
        canRejectSenderIds
      }
      canDisableSenderIds={
        canDisableSenderIds
      }
      canEnableSenderIds={
        canEnableSenderIds
      }
      canDefaultUpdateSenderIds={
        canDefaultUpdateSenderIds
      }
    />
  );
}