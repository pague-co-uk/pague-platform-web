import type { AuditLog } from "./api/audit-logs-api";

export function auditEntityLabel(log: AuditLog): string {
  for (const values of [log.newValues, log.oldValues]) {
    if (!values || typeof values !== "object" || Array.isArray(values)) continue;
    const record = values as Record<string, unknown>;
    for (const key of ["displayName", "companyName", "name", "sender", "username", "publicId", "code", "reference"]) {
      if (typeof record[key] === "string" && record[key].trim()) return record[key];
    }
  }
  return `${log.entityType.replace(/[_-]/g, " ")} record`;
}
