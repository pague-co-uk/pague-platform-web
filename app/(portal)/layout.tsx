import type {
  ReactNode,
} from "react";

import {
  AppShell,
} from "@/components/layout/app-shell";

import {
  requireAuth,
} from "@/lib/auth/require-auth";

import {
  getNavigation,
} from "@/lib/navigation/get-navigation";

// ============================================================================
// Types
// ============================================================================

interface PortalLayoutProps {
  children: ReactNode;
}

// ============================================================================
// Portal layout
// ============================================================================

export default async function PortalLayout({
  children,
}: PortalLayoutProps) {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const user =
    await requireAuth();

  // ==========================================================================
  // Authorization-aware navigation
  //
  // Permission checks happen exclusively on the server.
  //
  // getNavigation() removes permission information before the navigation
  // model is passed into the client-side AppShell.
  // ==========================================================================

  const navigation =
    getNavigation(
      user,
    );

  // ==========================================================================
  // Header presentation model
  //
  // Only presentation data is passed to the client-side shell.
  //
  // Roles, permissions, session identifiers, and other authorization data
  // remain server-side.
  // ==========================================================================

  const headerUser = {
    name:
      getDisplayName(
        user.firstName,
        user.lastName,
        user.username,
      ),

    email:
      user.email,

    initials:
      getInitials(
        user.firstName,
        user.lastName,
        user.username,
      ),
  };

  // ==========================================================================
  // Application shell
  // ==========================================================================

  return (
    <AppShell
      user={
        headerUser
      }
      navigation={
        navigation
      }
    >
      {children}
    </AppShell>
  );
}

// ============================================================================
// Display name
// ============================================================================

function getDisplayName(
  firstName: string,
  lastName: string,
  username: string,
): string {
  const name =
    [
      firstName.trim(),
      lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");

  return name || username;
}

// ============================================================================
// Initials
// ============================================================================

function getInitials(
  firstName: string,
  lastName: string,
  username: string,
): string {
  const first =
    firstName.trim();

  const last =
    lastName.trim();

  if (
    first &&
    last
  ) {
    return (
      first[0] +
      last[0]
    ).toUpperCase();
  }

  if (first) {
    return first
      .slice(0, 2)
      .toUpperCase();
  }

  if (last) {
    return last
      .slice(0, 2)
      .toUpperCase();
  }

  return username
    .trim()
    .slice(0, 2)
    .toUpperCase();
}