import "server-only";

import { notFound } from "next/navigation";

import { findClientById } from "@/features/clients/api/server-clients-api";
import { findSmppAccount } from "@/features/smpp-accounts/api/server-smpp-accounts-api";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import SmppAccountDetailsClient from "./smpp-account-details-client";

// ============================================================================
// Types
// ============================================================================

interface SmppAccountDetailsPageProps {
  readonly params: Promise<{
    id: string;
    accountId: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function SmppAccountDetailsPage({
  params,
}: SmppAccountDetailsPageProps) {
  const {
    id: clientId,
    accountId,
  } = await params;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissions = new Set(
    authenticatedUser.roles.flatMap(
      (role) =>
        role.permissions.map(
          (permission) =>
            permission.name,
        ),
    ),
  );

  const canReadSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_READ,
    );

  if (!canReadSmppAccounts) {
    notFound();
  }

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  const account =
    await findSmppAccount(
      clientId,
      accountId,
    );

  if (!account) {
    notFound();
  }

  const canUpdateSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_UPDATE,
    );

  const canChangeSmppPasswords =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_PASSWORD_UPDATE,
    );

  const canActivateSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_ACTIVATE,
    );

  const canDisableSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_DISABLE,
    );

  return (
    <SmppAccountDetailsClient
      client={client}
      account={account}
      canUpdateSmppAccounts={
        canUpdateSmppAccounts
      }
      canChangeSmppPasswords={
        canChangeSmppPasswords
      }
      canActivateSmppAccounts={
        canActivateSmppAccounts
      }
      canDisableSmppAccounts={
        canDisableSmppAccounts
      }
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
