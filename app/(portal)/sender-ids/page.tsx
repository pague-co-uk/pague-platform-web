import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  findPlatformSenderIds,
} from "@/features/sender-ids/api/server-sender-ids-api";

import PlatformSenderIdsClient from "@/features/sender-ids/components/platform-sender-ids-client";

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
    clientId?: string;
    search?: string;
    sender?: string;
    status?: string;
    isDefault?: string;
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
      clientId:
        query.clientId,
      search:
        query.search,
      sender:
        query.sender,
      status:
        query.status as
        | undefined,
      isDefault:
        query.isDefault !==
          undefined
          ? query.isDefault ===
          "true"
          : undefined,
    });

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PlatformSenderIdsClient
      senderIds={
        senderIds.items
      }
      pagination={
        senderIds.meta
      }
    />
  );
}