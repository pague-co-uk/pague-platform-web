import "server-only";

import { notFound } from "next/navigation";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import SmppAccountCreateClient from "./smpp-account-create-client";

interface SmppAccountCreatePageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function SmppAccountCreatePage({
  params,
}: SmppAccountCreatePageProps) {
  const { id: clientId } = await params;

  const authenticatedUser = await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissions = new Set(
    authenticatedUser.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    ),
  );

  const canCreateSmppAccounts = permissions.has(
    PERMISSIONS.SMPP_ACCOUNTS_CREATE,
  );

  if (!canCreateSmppAccounts) {
    notFound();
  }

  const client = await findClientById(clientId);

  if (!client) {
    notFound();
  }

  return (
    <SmppAccountCreateClient
      client={client}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
