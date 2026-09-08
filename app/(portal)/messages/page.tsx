import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  findPlatformMessages,
} from "@/features/messages/api/server-messages-api";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import PlatformMessagesClient from "@/features/messages/components/platform-messages-client";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Types
// ============================================================================

interface MessagesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    clientId?: string;
    search?: string;
    destination?: string;
    senderIdId?: string;
    status?: string;
    encoding?: string;
    submittedFrom?: string;
    submittedTo?: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function MessagesPage({
  searchParams,
}: MessagesPageProps) {
  const query =
    await searchParams;

  const user =
    await getCurrentUser();

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadMessages =
    user?.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.MESSAGES_READ,
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
        </div>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Pagination
  // ==========================================================================

  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Number(query.pageSize)
      : 20;

  // ==========================================================================
  // Messages
  // ==========================================================================

  const messages =
    await findPlatformMessages({
      page,
      pageSize,
      clientId:
        query.clientId,
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
    });

  // ==========================================================================
  // Create authorization
  // ==========================================================================

  const canCreateMessages =
    user!.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.MESSAGES_CREATE,
        ),
    ) ?? false;

  // ==========================================================================
  // Clients
  // ==========================================================================

  const clients =
    canCreateMessages
      ? await findClients({
        page: 1,
        pageSize: 100,
      })
      : {
        items: [],
      };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PlatformMessagesClient
      messages={
        messages.items
      }
      pagination={
        messages.meta
      }
      canCreateMessages={
        canCreateMessages
      }
      clients={
        clients.items
      }
    />
  );
}