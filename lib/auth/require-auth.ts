import "server-only";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "./get-current-user";

import type {
  CurrentUser,
} from "./get-current-user";

// ============================================================================
// Require authentication
// ============================================================================

export async function requireAuth(): Promise<CurrentUser> {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ========================================================================
  // Account state
  // ========================================================================

  if (
    !user.active ||
    user.locked
  ) {
    redirect("/login");
  }

  return user;
}