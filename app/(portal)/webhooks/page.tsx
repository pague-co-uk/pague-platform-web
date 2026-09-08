import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PERMISSIONS } from "@/lib/authorization/permissions";

import { findPlatformWebhooks } from "@/features/webhooks/api/server-webhooks.api";
import { PlatformWebhooksClient } from "@/features/webhooks/components/platform-webhooks-client";

import { findClients } from "@/features/clients/api/server-clients-api";

// ============================================================================
// Types
// ============================================================================

interface PlatformWebhooksPageProps {
  readonly searchParams: Promise<{
    page?: string;
    pageSize?: string;
    clientId?: string;
    enabled?: string;
    search?: string;
  }>;
}

// ============================================================================
// Page
// ============================================================================

export default async function PlatformWebhooksPage({
  searchParams,
}: PlatformWebhooksPageProps) {
  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  const permissions =
    new Set(
      authenticatedUser.roles.flatMap(
        (role) =>
          role.permissions.map(
            (permission) =>
              permission.name,
          ),
      ),
    );

  // ==========================================================================
  // Authorization
  // ==========================================================================

  const canReadWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_READ,
    );

  const canCreateWebhooks =
    permissions.has(
      PERMISSIONS.WEBHOOKS_CREATE,
    );

  if (!canReadWebhooks) {
    notFound();
  }

  // ==========================================================================
  // Query
  // ==========================================================================

  const query =
    await searchParams;

  // ==========================================================================
  // Webhooks
  // ==========================================================================

  const result =
    await findPlatformWebhooks({
      page:
        parsePositiveInteger(
          query.page,
        ) ?? 1,

      pageSize:
        parsePageSize(
          query.pageSize,
        ) ?? 20,

      clientId:
        query.clientId ||
        undefined,

      enabled:
        parseBoolean(
          query.enabled,
        ),

      search:
        query.search?.trim() ||
        undefined,
    });

  // ==========================================================================
  // Clients
  // ==========================================================================

  const clients =
    canCreateWebhooks
      ? await findClients({
        page: 1,
        pageSize: 100,
      })
      : null;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PlatformWebhooksClient
      webhooks={
        result.data
      }

      pagination={
        result.pagination
      }

      canCreateWebhooks={
        canCreateWebhooks
      }

      clients={
        clients?.items ?? []
      }
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function parsePositiveInteger(
  value: string | undefined,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return undefined;
  }

  return parsed;
}

function parsePageSize(
  value: string | undefined,
): number | undefined {
  const parsed =
    parsePositiveInteger(
      value,
    );

  if (
    parsed === undefined ||
    parsed > 100
  ) {
    return undefined;
  }

  return parsed;
}

function parseBoolean(
  value: string | undefined,
): boolean | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}