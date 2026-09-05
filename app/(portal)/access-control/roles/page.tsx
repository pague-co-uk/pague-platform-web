import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findRoles } from "@/features/access-control/api/server-roles-api";
import RolesClient from "./roles-client";

interface RolesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function RolesPage({
  searchParams,
}: RolesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const hasPermission = user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.name === PERMISSIONS.ROLES_READ,
    ),
  );

  if (!hasPermission) {
    redirect("/403");
  }

  const params = await searchParams;

  const page = params.page
    ? Number(params.page)
    : 1;

  const pageSize = params.pageSize
    ? Number(params.pageSize)
    : 20;

  const result = await findRoles({
    page:
      Number.isFinite(page) && page > 0
        ? page
        : 1,
    pageSize:
      Number.isFinite(pageSize) &&
        pageSize > 0
        ? pageSize
        : 20,
    search: params.search,
  });

  const canCreate = user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.name === PERMISSIONS.ROLES_CREATE,
    ),
  );

  return (
    <RolesClient
      roles={result.items}
      meta={result.meta}
      canCreate={canCreate}
    />
  );
}