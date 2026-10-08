import { notFound } from "next/navigation";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  findServiceById,
} from "@/features/services/api/services-server";

import EditServiceClient from "@/features/services/components/edit-service-client";

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissionNames =
    new Set(
      authenticatedUser.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  const canUpdateServices =
    permissionNames.has(
      PERMISSIONS.SERVICES_UPDATE,
    );

  if (!canUpdateServices) {
    notFound();
  }

  const { id } =
    await params;

  const service =
    await findServiceById(id);

  return (
    <EditServiceClient
      service={service}
    />
  );
}