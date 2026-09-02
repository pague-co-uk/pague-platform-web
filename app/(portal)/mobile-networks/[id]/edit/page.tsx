import { notFound } from "next/navigation";

import EditMobileNetworkClient from "@/features/mobile-networks/components/edit-mobile-network-client";

import {
  findMobileNetworkById,
  ServerMobileNetworksApiError,
} from "@/features/mobile-networks/api/server-mobile-networks-api";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";


interface EditMobileNetworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMobileNetworkPage({
  params,
}: EditMobileNetworkPageProps) {
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

  const canRead =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_READ,
    );

  const canUpdate =
    permissionNames.has(
      PERMISSIONS.MOBILE_NETWORKS_UPDATE,
    );

  if (!canRead || !canUpdate) {
    notFound();
  }

  const { id } =
    await params;

  let mobileNetwork;

  try {
    mobileNetwork =
      await findMobileNetworkById(id);
  } catch (error) {
    if (
      error instanceof
      ServerMobileNetworksApiError &&
      error.status === 404
    ) {
      notFound();
    }

    console.error(
      "Failed to load mobile network for editing",
      error,
    );

    notFound();
  }

  return (
    <EditMobileNetworkClient
      mobileNetwork={{
        id: mobileNetwork.id,
        publicId:
          mobileNetwork.publicId,
        name: mobileNetwork.name,
        code: mobileNetwork.code,
        countryCode:
          mobileNetwork.countryCode,
      }}
    />
  );
}