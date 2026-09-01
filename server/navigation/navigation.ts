import type {
  PortalUser,
} from "@/types/auth";

import type {
  NavigationItem,
} from "@/types/navigation";

export async function getPortalNavigation(
  user: PortalUser,
): Promise<NavigationItem[]> {
  /*
   * Authorization decisions belong here.
   *
   * This function may eventually call the Control Plane API to resolve
   * the authenticated user's permissions.
   *
   * Client components never receive the permission set.
   */

  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },

    {
      id: "messaging",
      label: "Messaging",
      href: "/messages",
      icon: "message",
    },

    {
      id: "clients",
      label: "Clients",
      href: "/clients",
      icon: "clients",
    },

    {
      id: "users",
      label: "Users",
      href: "/users",
      icon: "users",
    },

    {
      id: "float",
      label: "Float",
      href: "/float",
      icon: "wallet",
    },

    {
      id: "api-keys",
      label: "API Keys",
      href: "/api-keys",
      icon: "key",
    },

    {
      id: "connectors",
      label: "Connectors",
      href: "/connectors",
      icon: "plug",
    },

    {
      id: "routes",
      label: "Routes",
      href: "/routes",
      icon: "route",
    },

    {
      id: "smpp",
      label: "SMPP",
      href: "/smpp",
      icon: "server",
    },

    {
      id: "audit",
      label: "Audit",
      href: "/audit",
      icon: "history",
    },
  ];
}