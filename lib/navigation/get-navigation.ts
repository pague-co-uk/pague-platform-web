import "server-only";

import {
  hasPermission,
} from "@/lib/authorization/authorization";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

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

  children?: readonly NavigationItem[];
}

export interface NavigationSection {
  key: string;

  label?: string;

  items: readonly NavigationItem[];
}

interface NavigationDefinition
  extends NavigationItem {
  permission?: string;

  children?: readonly NavigationDefinition[];
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
    // Overview
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
            PERMISSIONS.MESSAGES_READ,
        },

        {
          key: "sender-ids",

          label: "Sender IDs",

          href: "/sender-ids",

          icon: "sender",

          permission:
            PERMISSIONS.SENDER_IDS_READ,
        },

        {
          key: "smpp-accounts",

          label: "SMPP Accounts",

          href: "/messaging/smpp-accounts",

          icon: "smpp",

          permission:
            PERMISSIONS.SMPP_ACCOUNTS_READ,
        },
      ],
    },

    // ==========================================================================
    // Network & Routing
    // ==========================================================================

    {
      key: "network-routing",

      label: "Network & Routing",

      icon: "network",

      children: [
        {
          key: "mobile-networks",

          label: "Mobile Networks",

          href: "/mobile-networks",

          icon: "mobile-network",

          permission:
            PERMISSIONS.MOBILE_NETWORKS_READ,
        },

        {
          key: "connectors",

          label: "Connectors",

          href: "/connectors",

          icon: "connector",

          permission:
            PERMISSIONS.CONNECTORS_READ,
        },

        {
          key: "routes",

          label: "Routes",

          href: "/routes",

          icon: "route",

          permission:
            PERMISSIONS.ROUTES_READ,
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
        PERMISSIONS.CLIENTS_READ,
    },

    // ==========================================================================
    // Finance
    // ==========================================================================

    {
      key: "finance",

      label: "Finance",

      icon: "wallet",

      children: [
        {
          key: "float",

          label: "Float",

          href: "/float",

          icon: "wallet",

          permission:
            PERMISSIONS.FLOAT_READ,
        },
      ],
    },

    // ==========================================================================
    // Integrations
    // ==========================================================================

    {
      key: "integrations",

      label: "Integrations",

      icon: "integrations",

      children: [
        {
          key: "webhooks",

          label: "Webhooks",

          href: "/webhooks",

          icon: "webhook",

          permission:
            PERMISSIONS.WEBHOOKS_READ,
        },

        {
          key: "api-keys",

          label: "API Keys",

          href: "/api-keys",

          icon: "key",

          permission:
            PERMISSIONS.API_KEYS_READ,
        },
      ],
    },

    // ==========================================================================
    // Administration
    // ==========================================================================

    {
      key: "administration",

      label: "Administration",

      icon: "settings",

      children: [
        {
          key: "users",

          label: "Users",

          href: "/users",

          icon: "users",

          permission:
            PERMISSIONS.USERS_READ,
        },

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
                PERMISSIONS.ROLES_READ,
            },

            {
              key: "permissions",

              label: "Permissions",

              href: "/access-control/permissions",

              icon: "permissions",

              permission:
                PERMISSIONS.PERMISSIONS_READ,
            },
          ],
        },

        {
          key: "audit",

          label: "Audit Logs",

          href: "/audit",

          icon: "audit",

          permission:
            PERMISSIONS.AUDIT_LOGS_READ,
        },
      ],
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