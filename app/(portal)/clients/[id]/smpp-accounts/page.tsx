import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import { findSmppAccounts } from "@/features/smpp-accounts/api/server-smpp-accounts-api";
import SmppAccountsClient from "./smpp-accounts-client";

interface SmppAccountsPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export default async function SmppAccountsPage({
  params,
}: SmppAccountsPageProps) {
  const {
    id: clientId,
  } = await params;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Permissions
  // ==========================================================================

  const permissions =
    new Set(
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

  // ==========================================================================
  // Client
  // ==========================================================================

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  // ==========================================================================
  // SMPP Accounts
  // ==========================================================================

  const smppAccounts =
    await findSmppAccounts(
      clientId,
    );

  // ==========================================================================
  // Capabilities
  // ==========================================================================

  const canCreateSmppAccounts =
    permissions.has(
      PERMISSIONS.SMPP_ACCOUNTS_CREATE,
    );

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
    <SmppAccountsClient
      client={client}
      smppAccounts={smppAccounts}
      canCreateSmppAccounts={
        canCreateSmppAccounts
      }
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
    />
  );
}