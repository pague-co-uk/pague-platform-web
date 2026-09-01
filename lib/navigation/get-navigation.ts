import "server-only";

import {
  hasPermission,
} from "@/lib/authorization/authorization";

import type {
  NavigationIconName,
} from "@/components/layout/navigation-icon";

import type {
  CurrentUser,
} from "@/lib/auth/get-current-user";

// ============================================================================
// Types
// ============================================================================

export interface NavigationItem {
  key: string;

  label: string;

  href?: string;

  icon: NavigationIconName;

  badge?: string | number;

  children?:
  readonly NavigationItem[];
}

export interface NavigationSection {
  key: string;

  label?: string;

  items:
  readonly NavigationItem[];
}

interface NavigationDefinition
  extends NavigationItem {
  permission?: string;

  children?:
  readonly NavigationDefinition[];
}

// ============================================================================
// Navigation definition
//
// This is the complete platform navigation.
//
// Permission checks happen exclusively on the server.
//
// The permission property is removed before navigation is returned to the
// client.
// ============================================================================

const NAVIGATION:
  readonly NavigationDefinition[] = [
    // ==========================================================================
    // Dashboard
    // ==========================================================================

    {
      key: "dashboard",

      label: "Dashboard",

      href: "/",

      icon: "dashboard",
    },

    // ==========================================================================
    // Messaging
    // ==========================================================================

    {
      key: "messaging",

      label: "Messaging",

      icon: "messages",

      children: [
        {
          key: "messages",

          label: "Messages",

          href: "/messaging/messages",

          icon: "messages",

          permission:
            "messages.read",
        },

        {
          key: "sender-ids",

          label: "Sender IDs",

          href: "/messaging/sender-ids",

          icon: "sender",

          permission:
            "sender_ids.read",
        },

        {
          key: "smpp-accounts",

          label: "SMPP Accounts",

          href: "/messaging/smpp-accounts",

          icon: "smpp",

          permission:
            "smpp_accounts.read",
        },
      ],
    },

    // ==========================================================================
    // Clients
    // ==========================================================================

    {
      key: "clients",

      label: "Clients",

      href: "/clients",

      icon: "clients",

      permission:
        "clients.read",
    },

    // ==========================================================================
    // Float
    // ==========================================================================

    {
      key: "float",

      label: "Float",

      href: "/float",

      icon: "wallet",

      permission:
        "float.read",
    },

    // ==========================================================================
    // Webhooks
    // ==========================================================================

    {
      key: "webhooks",

      label: "Webhooks",

      href: "/webhooks",

      icon: "webhook",

      permission:
        "webhooks:read",
    },

    // ==========================================================================
    // Users
    // ==========================================================================

    {
      key: "users",

      label: "Users",

      href: "/users",

      icon: "users",

      permission:
        "users.read",
    },

    // ==========================================================================
    // Access Control
    // ==========================================================================

    {
      key: "access-control",

      label: "Access Control",

      icon: "shield",

      children: [
        {
          key: "roles",

          label: "Roles",

          href: "/access-control/roles",

          icon: "roles",

          permission:
            "roles.read",
        },

        {
          key: "permissions",

          label: "Permissions",

          href: "/access-control/permissions",

          icon: "permissions",

          permission:
            "permissions.read",
        },
      ],
    },

    // ==========================================================================
    // API Keys
    // ==========================================================================

    {
      key: "api-keys",

      label: "API Keys",

      href: "/api-keys",

      icon: "key",

      permission:
        "api_keys.read",
    },

    // ==========================================================================
    // Audit Logs
    // ==========================================================================

    {
      key: "audit",

      label: "Audit Logs",

      href: "/audit",

      icon: "audit",

      permission:
        "audit_logs.read",
    },
  ];

// ============================================================================
// Get navigation
// ============================================================================

export function getNavigation(
  user: CurrentUser,
): readonly NavigationSection[] {
  const items =
    NAVIGATION
      .map(
        (item) =>
          filterNavigationItem(
            user,
            item,
          ),
      )
      .filter(
        (
          item,
        ): item is NavigationItem =>
          item !== null,
      );

  return [
    {
      key: "main",

      items,
    },
  ];
}

// ============================================================================
// Filter navigation item
// ============================================================================

function filterNavigationItem(
  user: CurrentUser,
  item: NavigationDefinition,
): NavigationItem | null {
  // ==========================================================================
  // Permission
  // ==========================================================================

  if (
    item.permission &&
    !hasPermission(
      user,
      item.permission,
    )
  ) {
    return null;
  }

  // ==========================================================================
  // Children
  // ==========================================================================

  const children =
    item.children
      ?.map(
        (child) =>
          filterNavigationItem(
            user,
            child,
          ),
      )
      .filter(
        (
          child,
        ): child is NavigationItem =>
          child !== null,
      );

  // ==========================================================================
  // Parent with children but no accessible children
  // ==========================================================================

  if (
    item.children &&
    (!children ||
      children.length === 0)
  ) {
    return null;
  }

  // ==========================================================================
  // Client-safe navigation item
  //
  // Deliberately do not return `permission`.
  // The client must never receive authorization rules.
  // ==========================================================================

  return {
    key:
      item.key,

    label:
      item.label,

    ...(item.href
      ? {
        href:
          item.href,
      }
      : {}),

    icon:
      item.icon,

    ...(item.badge !==
      undefined
      ? {
        badge:
          item.badge,
      }
      : {}),

    ...(children &&
      children.length > 0
      ? {
        children,
      }
      : {}),
  };
}