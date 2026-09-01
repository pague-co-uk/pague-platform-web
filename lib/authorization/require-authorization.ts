import "server-only";

import {
  notFound,
} from "next/navigation";

import type {
  CurrentUser,
} from "@/lib/auth/get-current-user";

import {
  requireAuth,
} from "@/lib/auth/require-auth";

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./authorization";

// ============================================================================
// Require permission
// ============================================================================

export async function requirePermission(
  permission: string,
): Promise<CurrentUser> {
  const user =
    await requireAuth();

  if (
    !hasPermission(
      user,
      permission,
    )
  ) {
    notFound();
  }

  return user;
}

// ============================================================================
// Require any permission
// ============================================================================

export async function requireAnyPermission(
  permissions: readonly string[],
): Promise<CurrentUser> {
  const user =
    await requireAuth();

  if (
    !hasAnyPermission(
      user,
      permissions,
    )
  ) {
    notFound();
  }

  return user;
}

// ============================================================================
// Require all permissions
// ============================================================================

export async function requireAllPermissions(
  permissions: readonly string[],
): Promise<CurrentUser> {
  const user =
    await requireAuth();

  if (
    !hasAllPermissions(
      user,
      permissions,
    )
  ) {
    notFound();
  }

  return user;
}