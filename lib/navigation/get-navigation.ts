import "server-only";

import type {
  NavigationIconName,
} from "@/components/layout/navigation-icon";

import type {
  CurrentUser,
} from "@/lib/auth/get-current-user";

import {
  hasPermission,
} from "@/lib/authorization/authorization";

import {
  PERMISSIONS,
} from "@/lib/authorization/permissions";

// ============================================================================
// Constants
// ============================================================================

const PLATFORM_SUPER_ADMIN =
  "PLATFORM_SUPER_ADMIN";

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
// Client Navigation
//
// Client users operate within their own client context.
//
// Client-owned resources are explicitly scoped using the authenticated user's
// clientId.
//
// Client-scoped routes:
//
//   /clients/:clientId/messages
//   /clients/:clientId/sender-ids
//   /clients/:clientId/api-keys
//   /clients/:clientId/webhooks
//   /clients/:clientId/smpp-accounts
//   /clients/:clientId/float
//
// Client users do not receive platform-wide Clients management navigation.
// ============================================================================

function getClientNavigation(
  user: CurrentUser,
): readonly NavigationDefinition[] {
  return [
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

          href:
            `/clients/${user.clientId}/messages`,

          icon: "messages",

          permission:
            PERMISSIONS.MESSAGES_READ,
        },

        {
          key: "sender-ids",

          label: "Sender IDs",

          href:
            `/clients/${user.clientId}/sender-ids`,

          icon: "sender",

          permission:
            PERMISSIONS.SENDER_IDS_READ,
        },
      ],
    },

    // ==========================================================================
    // Infrastructure
    // ==========================================================================

    {
      key: "infrastructure",

      label: "Infrastructure",

      icon: "settings",

      children: [
        {
          key: "api-keys",

          label: "API Keys",

          href:
            `/clients/${user.clientId}/api-keys`,

          icon: "key",

          permission:
            PERMISSIONS.API_KEYS_READ,
        },

        {
          key: "webhooks",

          label: "Webhooks",

          href:
            `/clients/${user.clientId}/webhooks`,

          icon: "webhook",

          permission:
            PERMISSIONS.WEBHOOKS_READ,
        },

        {
          key: "smpp-accounts",

          label: "SMPP Accounts",

          href:
            `/clients/${user.clientId}/smpp-accounts`,

          icon: "smpp",

          permission:
            PERMISSIONS.SMPP_ACCOUNTS_READ,
        },
      ],
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

          href:
            `/clients/${user.clientId}/float`,

          icon: "wallet",

          permission:
            PERMISSIONS.FLOAT_READ,
        },
      ],
    },
  ];
}

// ============================================================================
// Platform Navigation
//
// Platform users operate across all clients.
//
// Platform resources deliberately use global routes:
//
//   /clients
//   /messages
//   /sender-ids
//   /api-keys
//   /webhooks
//   /smpp-accounts
//   /float
//
// Platform resource pages are responsible for client selection/filtering where
// the underlying resource belongs to a client.
// ============================================================================

function getPlatformNavigation(): readonly NavigationDefinition[] {
  return [
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

      icon: "clients",

      children: [
        {
          key: "clients-list",

          label: "Clients",

          href: "/clients",

          icon: "clients",

          permission:
            PERMISSIONS.CLIENTS_READ,
        },
      ],
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

          href: "/messages",

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
      ],
    },

    // ==========================================================================
    // Infrastructure
    // ==========================================================================

    {
      key: "infrastructure",

      label: "Infrastructure",

      icon: "settings",

      children: [
        {
          key: "api-keys",

          label: "API Keys",

          href: "/api-keys",

          icon: "key",

          permission:
            PERMISSIONS.API_KEYS_READ,
        },

        {
          key: "webhooks",

          label: "Webhooks",

          href: "/webhooks",

          icon: "webhook",

          permission:
            PERMISSIONS.WEBHOOKS_READ,
        },

        {
          key: "smpp-accounts",

          label: "SMPP Accounts",

          href: "/smpp-accounts",

          icon: "smpp",

          permission:
            PERMISSIONS.SMPP_ACCOUNTS_READ,
        },
      ],
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
          key: "roles",

          label: "Roles",

          href: "/access-control/roles",

          icon: "roles",

          permission:
            PERMISSIONS.ROLES_READ,
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
}

// ============================================================================
// Platform Context
//
// PLATFORM_SUPER_ADMIN is the role that determines whether the user operates
// in platform context.
//
// Individual resource visibility is still controlled by permissions.
// ============================================================================

function isPlatformUser(
  user: CurrentUser,
): boolean {
  return user.roles.some(
    (role) =>
      role.name ===
      PLATFORM_SUPER_ADMIN,
  );
}

// ============================================================================
// Get Navigation
// ============================================================================

export function getNavigation(
  user: CurrentUser,
): readonly NavigationSection[] {
  const definition =
    isPlatformUser(user)
      ? getPlatformNavigation()
      : getClientNavigation(user);

  const items =
    definition
      .map((item) =>
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
// Filter Navigation Item
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
      ?.map((child) =>
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
  // Parent With No Accessible Children
  // ==========================================================================

  if (
    item.children &&
    (!children ||
      children.length === 0)
  ) {
    return null;
  }

  // ==========================================================================
  // Client-Safe Navigation Item
  //
  // Deliberately omit `permission`.
  // Authorization remains server-side.
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