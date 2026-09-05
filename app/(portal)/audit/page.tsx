import { notFound } from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import { findAuditLogs } from "@/features/audit-logs/api/server-audit-logs-api";

import type {
  AuditLog,
  AuditLogMeta,
} from "@/features/audit-logs/api/audit-logs-api";

import {
  findClients,
} from "@/features/clients/api/server-clients-api";

import {
  findUsers,
} from "@/features/users/api/server-users-api";

import AuditLogsClient from "./audit-logs-client";

// ============================================================================
// Types
// ============================================================================

type AuditLogFilter =
  | "client"
  | "user"
  | "action"
  | "entity";

interface AuditLogsPageProps {
  readonly searchParams: Promise<{
    readonly search?: string;

    readonly filter?: string;

    readonly clientId?: string;

    readonly userId?: string;

    readonly action?: string;

    readonly entityType?: string;

    readonly entityId?: string;

    readonly page?: string;

    readonly pageSize?: string;
  }>;
}

interface AuditLogResult {
  readonly data: readonly AuditLog[];

  readonly pagination: AuditLogMeta;
}

// ============================================================================
// Page
// ============================================================================

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const query =
    await searchParams;

  const authenticatedUser =
    await getCurrentUser();

  if (!authenticatedUser) {
    notFound();
  }

  // ==========================================================================
  // Permissions
  // ==========================================================================

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

  const canReadAuditLogs =
    permissions.has(
      PERMISSIONS.AUDIT_LOGS_READ,
    );

  if (!canReadAuditLogs) {
    notFound();
  }

  // ==========================================================================
  // Filter
  // ==========================================================================

  const filter =
    parseAuditLogFilter(
      query.filter,
    ) ?? "client";

  // ==========================================================================
  // Pagination
  // ==========================================================================

  const page =
    parsePositiveInteger(
      query.page,
    ) ?? 1;

  const pageSize =
    parsePageSize(
      query.pageSize,
    ) ?? 20;

  // ==========================================================================
  // Search
  // ==========================================================================

  const search =
    query.search?.trim() ?? "";

  // ==========================================================================
  // Filter values
  // ==========================================================================

  const clientId =
    query.clientId?.trim() ?? "";

  const userId =
    query.userId?.trim() ?? "";

  const action =
    query.action?.trim() ?? "";

  const entityType =
    query.entityType?.trim() ?? "";

  const entityId =
    query.entityId?.trim() ?? "";

  // ==========================================================================
  // Load selector data
  // ==========================================================================

  const [
    clientsResult,
    usersResult,
  ] = await Promise.all([
    findClients({
      page: 1,
      pageSize: 100,
    }),

    findUsers({
      page: 1,
      pageSize: 100,
    }),
  ]);

  // ==========================================================================
  // Audit logs
  // ==========================================================================

  const result = await findAuditLogs({
    search: search || undefined,
    clientId: clientId || undefined,
    userId: userId || undefined,
    action: action || undefined,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    page,
    pageSize,
  });

  const auditLogs: AuditLogResult = {
    data: result.data,
    pagination: result.pagination,
  };

  // ==========================================================================
  // Selector options
  // ==========================================================================

  const clients =
    clientsResult.items.map(
      (client) => ({
        value: client.id,

        label:
          client.displayName ||
          client.companyName,
      }),
    );

  const users =
    usersResult.items.map(
      (user) => ({
        value: user.id,

        label:
          getUserLabel(user),
      }),
    );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <AuditLogsClient
      auditLogs={
        auditLogs.data
      }
      pagination={
        auditLogs.pagination
      }
      clients={
        clients
      }
      users={
        users
      }
    />
  );
}

// ============================================================================
// User label
// ============================================================================

function getUserLabel(
  user: {
    readonly id: string;

    readonly firstName?: string | null;

    readonly lastName?: string | null;

    readonly email?: string | null;
  },
): string {
  const name =
    [
      user.firstName,
      user.lastName,
    ]
      .filter(
        (
          value,
        ): value is string =>
          Boolean(
            value?.trim(),
          ),
      )
      .join(" ");

  if (name) {
    return name;
  }

  if (
    user.email &&
    user.email.trim()
  ) {
    return user.email;
  }

  return user.id;
}

// ============================================================================
// Filter parsing
// ============================================================================

function parseAuditLogFilter(
  value:
    | string
    | undefined,
): AuditLogFilter | undefined {
  switch (value) {
    case "client":
    case "user":
    case "action":
    case "entity":
      return value;

    default:
      return undefined;
  }
}

// ============================================================================
// Pagination helpers
// ============================================================================

function parsePositiveInteger(
  value:
    | string
    | undefined,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed < 1
  ) {
    return undefined;
  }

  return parsed;
}

function parsePageSize(
  value:
    | string
    | undefined,
): number | undefined {
  const parsed =
    parsePositiveInteger(
      value,
    );

  if (
    parsed === undefined
  ) {
    return undefined;
  }

  return Math.min(
    parsed,
    100,
  );
}