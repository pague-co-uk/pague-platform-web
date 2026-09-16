import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  findPlatformSenderIds,
} from "@/features/sender-ids/api/server-sender-ids-api";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import SenderIdsClient from "@/features/sender-ids/components/sender-ids-client";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Types
// ============================================================================

interface SenderIdsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    clientId?: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function SenderIdsPage({
  searchParams,
}: SenderIdsPageProps) {
  const query =
    await searchParams;

  const user =
    await getCurrentUser();

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadSenderIds =
    user?.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.SENDER_IDS_READ,
        ),
    ) ?? false;

  if (!canReadSenderIds) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Access denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to view Sender IDs.
          </p>
        </div>
      </PageContainer>
    );
  }

  const canCreateSenderIds =
    user?.roles?.some(
      (role) =>
        role.permissions?.some(
          (permission) =>
            permission.name ===
            PERMISSIONS.SENDER_IDS_CREATE,
        ),
    ) ?? false;

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
  // Sender IDs
  // ==========================================================================

  const senderIds =
    await findPlatformSenderIds({
      page,
      pageSize,
      search:
        query.search,
      status:
        query.status as
        | undefined,
      clientId:
        query.clientId,
    });

  // ==========================================================================
  // Clients
  // ==========================================================================

  const clients =
    canCreateSenderIds
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
    <SenderIdsClient
      senderIds={
        senderIds.items
      }
      pagination={
        senderIds.meta
      }
      canCreateSenderIds={
        canCreateSenderIds
      }
      clients={
        clients.items
      }
    />
  );
}