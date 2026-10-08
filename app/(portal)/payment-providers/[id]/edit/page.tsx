import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  PaymentProvidersApiError,
  findPaymentProviderById,
} from "@/features/payment-providers/api/payment-providers-server";

import PaymentProviderEditClient from "@/features/payment-providers/components/payment-provider-edit-client";

interface PaymentProviderEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentProviderEditPage({
  params,
}: PaymentProviderEditPageProps) {
  const {
    id: providerId,
  } = await params;

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

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.PAYMENT_PROVIDERS_UPDATE,
    );

  if (!canRead || !canUpdate) {
    notFound();
  }

  let provider;

  try {
    provider =
      await findPaymentProviderById(
        providerId,
      );
  } catch (error) {
    if (
      error instanceof
      PaymentProvidersApiError &&
      error.status === 404
    ) {
      notFound();
    }

    console.error(
      "[Payment Provider] Unable to load payment provider for editing.",
      error,
    );

    notFound();
  }

  return (
    <PaymentProviderEditClient
      initialProvider={provider}
    />
  );
}