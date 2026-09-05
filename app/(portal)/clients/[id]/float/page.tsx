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

import {
  findFloatLedger,
  getFloatBalance,
} from "@/features/float/api/server-float-api";
import FloatClient from "./float-page-client";


interface FloatPageProps {
  readonly params: Promise<{
    id: string;
  }>;

  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function FloatPage({
  params,
  searchParams,
}: FloatPageProps) {
  const {
    id: clientId,
  } = await params;

  const query =
    await searchParams;

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

  const canAdjustFloat =
    permissions.has(PERMISSIONS.FLOAT_ADJUST);

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

  const canTopUpFloat =
    permissions.has(
      PERMISSIONS.FLOAT_TOP_UP,
    );

  const page =
    parsePositiveInteger(
      query.page,
    ) ?? 1;

  const pageSize =
    parsePageSize(
      query.pageSize,
    ) ?? 20;

  const [
    balance,
    ledger,
  ] = await Promise.all([
    getFloatBalance(
      clientId,
    ),

    findFloatLedger(
      clientId,
      {
        page,
        pageSize,
      },
    ),
  ]);

  return (
    <FloatClient
      client={client}
      balance={balance}
      ledger={ledger.items}
      pagination={ledger.meta}
      canTopUpFloat={
        canTopUpFloat
      }
      canAdjustFloat={canAdjustFloat}
    />
  );
}

// ============================================================================
// Query helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed < 1
  ) {
    return undefined;
  }

  return parsed;
}

function parsePageSize(
  value: string | undefined,
): number | undefined {
  const parsed =
    parsePositiveInteger(
      value,
    );

  if (
    parsed === undefined ||
    parsed > 100
  ) {
    return undefined;
  }

  return parsed;
}