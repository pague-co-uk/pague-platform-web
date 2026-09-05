import {
  notFound,
} from "next/navigation";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

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

  if (!client) {
    notFound();
  }

  return (
    <NewMessageClient
      client={client}
    />
  );
}