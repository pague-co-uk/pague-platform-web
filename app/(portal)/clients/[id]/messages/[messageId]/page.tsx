import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  findMessageById,
  findMessageStatusEvents,
} from "@/features/messages/api/server-messages-api";

import MessageDetailsClient from "@/features/messages/components/message-details-client";

import {
  findClientById,
} from "@/features/clients/api/server-clients-api";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";
import { isPlatformUser } from "@/lib/authorization/authorization";

// ============================================================================
// Types
// ============================================================================

interface MessageDetailsPageProps {
  params: Promise<{
    id: string;
    messageId: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function MessageDetailsPage({
  params,
}: MessageDetailsPageProps) {
  const {
    id: clientId,
    messageId,
  } = await params;

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

          <div className="mt-5">
            <Link
              href={`/messages`}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              Back to messages
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ==========================================================================
  // Load data
  // ==========================================================================

  const [
    client,
    message,
    statusEvents,
  ] = await Promise.all([
    findClientById(
      clientId,
    ),

    findMessageById(
      clientId,
      messageId,
    ),

    findMessageStatusEvents(
      clientId,
      messageId,
    ),
  ]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <MessageDetailsClient
      client={client}
      message={message}
      statusEvents={statusEvents}
      showPlatformBackLink={user ? isPlatformUser(user) : false}
    />
  );
}
