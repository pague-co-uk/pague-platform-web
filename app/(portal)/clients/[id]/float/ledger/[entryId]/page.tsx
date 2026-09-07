import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import {
  findFloatLedgerEntry,
} from "@/features/float/api/server-float-api";

import FloatLedgerEntryClient from "./float-ledger-entry-client";

interface FloatLedgerEntryPageProps {
  readonly params: Promise<{
    id: string;
    entryId: string;
  }>;
}

export default async function FloatLedgerEntryPage({
  params,
}: FloatLedgerEntryPageProps) {
  const {
    id: clientId,
    entryId,
  } = await params;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

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

  const canReadFloat =
    permissions.has(
      PERMISSIONS.FLOAT_READ,
    );

  if (!canReadFloat) {
    notFound();
  }

  const client =
    await findClientById(
      clientId,
    );

  if (!client) {
    notFound();
  }

  const entry =
    await findFloatLedgerEntry(
      clientId,
      entryId,
    );

  if (!entry) {
    notFound();
  }

  return (
    <FloatLedgerEntryClient
      client={client}
      entry={entry}
      showPlatformBackLink={isPlatformUser(authenticatedUser)}
    />
  );
}
