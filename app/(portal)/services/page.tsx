import { notFound } from "next/navigation";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findServices,
} from "@/features/services/api/services-server";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import ServicesClient from "./services-client";

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    category?: "MESSAGING" | "PAYMENTS";
    status?: "ACTIVE" | "DISABLED";
    sort?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
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

  const canReadServices =
    permissionNames.has(
      PERMISSIONS.SERVICES_READ,
    );

  if (!canReadServices) {
    notFound();
  }

  const canCreateServices =
    permissionNames.has(
      PERMISSIONS.SERVICES_CREATE,
    );

  const canUpdateServices =
    permissionNames.has(
      PERMISSIONS.SERVICES_UPDATE,
    );

  const params =
    await searchParams;

  const page = Math.max(
    Number(params.page ?? "1") || 1,
    1,
  );

  const pageSize = Math.min(
    Math.max(
      Number(
        params.pageSize ?? "20",
      ) || 20,
      1,
    ),
    100,
  );

  const category =
    params.category === "MESSAGING" ||
      params.category === "PAYMENTS"
      ? params.category
      : undefined;

  const status =
    params.status === "ACTIVE" ||
      params.status === "DISABLED"
      ? params.status
      : undefined;

  const servicesResult =
    await findServices({
      page,
      pageSize,
      search:
        params.search || undefined,
      category,
      status,
      sort:
        params.sort || undefined,
    });

  return (
    <ServicesClient
      initialServices={
        servicesResult.items
      }
      meta={
        servicesResult.meta
      }
      canCreateServices={
        canCreateServices
      }
      canUpdateServices={
        canUpdateServices
      }
    />
  );
}