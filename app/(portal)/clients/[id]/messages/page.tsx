import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  findMessages,
} from "@/features/messages/api/server-messages-api";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import MessagesClient from "@/features/messages/components/messages-client";
import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";


interface MessagesPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    destination?: string;
    senderIdId?: string;
    status?: string;
    encoding?: string;
    submittedFrom?: string;
    submittedTo?: string;
  }>;
}

export default async function MessagesPage({
  params,
  searchParams,
}: MessagesPageProps) {
  const {
    id: clientId,
  } = await params;

  const query =
    await searchParams;

  const user =
    await getCurrentUser();

  const canReadMessages =
    user!.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.MESSAGES_READ,
        ),
    ) ?? false;

  const canCreateMessages =
    user!.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.MESSAGES_CREATE,
        ),
    ) ?? false;

  if (!canReadMessages) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Access denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to view messages.
          </p>

          <Link
            href={`/clients/${encodeURIComponent(
              clientId,
            )}`}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to client
          </Link>
        </div>
      </PageContainer>
    );
  }

  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Number(query.pageSize)
      : 20;

  const [
    client,
    messages,
  ] = await Promise.all([
    findClientById(clientId),

    findMessages(
      clientId,
      {
        page,
        pageSize,
        search:
          query.search,
        destination:
          query.destination,
        senderIdId:
          query.senderIdId,
        status:
          query.status as
          | undefined,
        encoding:
          query.encoding as
          | undefined,
        submittedFrom:
          query.submittedFrom,
        submittedTo:
          query.submittedTo,
      },
    ),
  ]);

  return (
    <MessagesClient
      client={client}
      messages={
        messages.items
      }
      pagination={
        messages.meta
      }
      canCreateMessages={
        canCreateMessages
      }
    />
  );
}