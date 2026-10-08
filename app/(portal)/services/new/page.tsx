import { notFound } from "next/navigation";

import CreateServiceClient from "@/features/services/components/create-service-client";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export default async function NewServicePage() {
  const authenticatedUser = await getCurrentUser();

  const permissionNames = new Set(
    authenticatedUser!.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    ),
  );

  if (!permissionNames.has(PERMISSIONS.SERVICES_CREATE)) {
    notFound();
  }

  return <CreateServiceClient />;
}