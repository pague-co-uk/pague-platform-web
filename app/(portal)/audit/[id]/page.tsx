import {
  notFound,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

import {
  findAuditLog,
} from "@/features/audit-logs/api/server-audit-logs-api";

import AuditLogDetailsClient from "./audit-log-details-client";

export default async function AuditLogDetailsPage({
  params,
}: {
  readonly params: Promise<{
    readonly id: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  if (
    !user.roles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.name ===
          PERMISSIONS.AUDIT_LOGS_READ,
      ),
    )
  ) {
    notFound();
  }

  const { id } = await params;

  const auditLog =
    await findAuditLog(id);

  if (!auditLog) {
    notFound();
  }

  return (
    <AuditLogDetailsClient
      auditLog={auditLog}
    />
  );
}