import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import PaymentProviderCreateClient from "@/features/payment-providers/components/payment-provider-create-client";

export default async function PaymentProviderCreatePage() {
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

  const canCreate =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_CREATE,
    );

  if (!canCreate) {
    notFound();
  }

  return (
    <PaymentProviderCreateClient />
  );
}