import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import NewClientClient from "./new-client-client";

export default async function NewClientPage() {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    return null;
  }

  const canCreateClients =
    authenticatedUser.roles.some(
      (role) =>
        role.permissions.some(
          (permission) =>
            permission.name ===
            "clients.create",
        ),
    );

  if (!canCreateClients) {
    return null;
  }

  return (
    <NewClientClient />
  );
}