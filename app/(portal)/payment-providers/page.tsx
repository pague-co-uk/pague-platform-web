import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findPaymentProviders,
} from "@/features/payment-providers/api/payment-providers-server";

import PaymentProvidersClient from "@/features/payment-providers/components/payment-providers-client";

interface PaymentProvidersPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: "ACTIVE" | "DISABLED";
    sort?: string;
  }>;
}

export default async function PaymentProvidersPage({
  searchParams,
}: PaymentProvidersPageProps) {
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

  const canRead =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_READ,
    );

  if (!canRead) {
    notFound();
  }

  const canCreate =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_CREATE,
    );

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_UPDATE,
    );

  const canEnable =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_ENABLE,
    );

  const canDisable =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_DISABLE,
    );

  const queryParams =
    await searchParams;

  const page = Math.max(
    Number(queryParams.page ?? "1") || 1,
    1,
  );

  const pageSize = Math.min(
    Math.max(
      Number(
        queryParams.pageSize ?? "20",
      ) || 20,
      1,
    ),
    100,
  );

  const status =
    queryParams.status === "ACTIVE" ||
      queryParams.status === "DISABLED"
      ? queryParams.status
      : undefined;

  const providers =
    await findPaymentProviders({
      page,
      pageSize,
      search:
        queryParams.search ||
        undefined,
      status,
      sort:
        queryParams.sort ||
        undefined,
    });

  return (
    <PaymentProvidersClient
      initialProviders={
        providers.items
      }
      meta={providers.meta}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canEnable={canEnable}
      canDisable={canDisable}
    />
  );
}