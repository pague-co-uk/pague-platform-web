import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import CreateSenderIdClient from "@/features/sender-ids/components/create-sender-id-client";

export default async function NewSenderIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const canCreateSenderIds =
    permissionNames.has(
      PERMISSIONS.SENDER_IDS_CREATE,
    );

  if (!canCreateSenderIds) {
    notFound();
  }

  const { id: clientId } = await params;

  return (
    <CreateSenderIdClient
      clientId={clientId}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
