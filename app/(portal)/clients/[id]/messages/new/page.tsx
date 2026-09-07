import {
  notFound,
} from "next/navigation";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isPlatformUser } from "@/lib/authorization/authorization";

import NewMessageClient from "./NewMessageClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewMessagePage({
  params,
}: PageProps) {
  const { id } =
    await params;

  const client =
    await findClientById(id);
  const user = await getCurrentUser();

  if (!client) {
    notFound();
  }

  return (
    <NewMessageClient
      client={client}
      showPlatformBackLink={user ? isPlatformUser(user) : false}
    />
  );
}
