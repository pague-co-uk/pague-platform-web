export const PERMISSIONS = {

  // ==========================================================================
  // API Keys
  // ==========================================================================

  API_KEYS_CREATE: "api_keys.create",

  API_KEYS_READ: "api_keys.read",

  API_KEYS_REVOKE: "api_keys.revoke",

  // ==========================================================================
  // Audit Logs
  // ==========================================================================

  AUDIT_LOGS_READ: "audit_logs.read",

  // ==========================================================================
  // Clients
  // ==========================================================================

  CLIENTS_ACTIVATE: "clients.activate",

  CLIENTS_CREATE: "clients.create",

  CLIENTS_DELETE: "clients.delete",

  CLIENTS_DISABLE: "clients.disable",

  CLIENTS_READ: "clients.read",

  CLIENTS_SUSPEND: "clients.suspend",

  CLIENTS_UPDATE: "clients.update",

  // ==========================================================================
  // Connectors
  // ==========================================================================

  CONNECTORS_CREATE: "connectors.create",

  CONNECTORS_DELETE: "connectors.delete",

  CONNECTORS_DISABLE: "connectors.disable",

  CONNECTORS_ENABLE: "connectors.enable",

  CONNECTORS_READ: "connectors.read",

  CONNECTORS_SUSPEND: "connectors.suspend",

  CONNECTORS_UPDATE: "connectors.update",

  // ==========================================================================
  // Float
  // ==========================================================================

  FLOAT_ADJUST: "float.adjust",

  FLOAT_DEBIT: "float.debit",

  FLOAT_READ: "float.read",

  FLOAT_REFUND: "float.refund",

  FLOAT_TOP_UP: "float.top_up",

  // ==========================================================================
  // Messages
  // ==========================================================================

  MESSAGES_CREATE: "messages.create",

  MESSAGES_READ: "messages.read",

  // ==========================================================================
  // Mobile Networks
  // ==========================================================================

  MOBILE_NETWORKS_CREATE:
    "mobile_networks.create",

  MOBILE_NETWORKS_DELETE:
    "mobile_networks.delete",

  MOBILE_NETWORKS_DISABLE:
    "mobile_networks.disable",

  MOBILE_NETWORKS_ENABLE:
    "mobile_networks.enable",

  MOBILE_NETWORKS_READ:
    "mobile_networks.read",

  MOBILE_NETWORKS_UPDATE:
    "mobile_networks.update",

  // ==========================================================================
  // Permissions
  // ==========================================================================

  PERMISSIONS_READ:
    "permissions.read",

  // ==========================================================================
  // Platform
  // ==========================================================================

  PLATFORM_SUPER_ADMIN:
    "PLATFORM_SUPER_ADMIN",

  // ==========================================================================
  // Roles
  // ==========================================================================

  ROLES_CREATE:
    "roles.create",

  ROLES_DELETE:
    "roles.delete",

  ROLES_READ:
    "roles.read",

  ROLES_UPDATE:
    "roles.update",

  // ==========================================================================
  // Routes
  // ==========================================================================

  ROUTES_CREATE:
    "routes.create",

  ROUTES_DELETE:
    "routes.delete",

  ROUTES_DISABLE:
    "routes.disable",

  ROUTES_ENABLE:
    "routes.enable",

  ROUTES_READ:
    "routes.read",

  ROUTES_UPDATE:
    "routes.update",

  // ==========================================================================
  // Sender IDs
  // ==========================================================================

  SENDER_IDS_APPROVE:
    "sender_ids.approve",

  SENDER_IDS_CREATE:
    "sender_ids.create",

  SENDER_IDS_DEFAULT_UPDATE:
    "sender_ids.default.update",

  SENDER_IDS_DELETE:
    "sender_ids.delete",

  SENDER_IDS_DISABLE:
    "sender_ids.disable",

  SENDER_IDS_ENABLE:
    "sender_ids.enable",

  SENDER_IDS_READ:
    "sender_ids.read",

  SENDER_IDS_REJECT:
    "sender_ids.reject",

  SENDER_IDS_UPDATE:
    "sender_ids.update",

  // ==========================================================================
  // SMPP Accounts
  // ==========================================================================

  SMPP_ACCOUNTS_ACTIVATE:
    "smpp_accounts.activate",

  SMPP_ACCOUNTS_CREATE:
    "smpp_accounts.create",

  SMPP_ACCOUNTS_DISABLE:
    "smpp_accounts.disable",

  SMPP_ACCOUNTS_PASSWORD_UPDATE:
    "smpp_accounts.password.update",

  SMPP_ACCOUNTS_READ:
    "smpp_accounts.read",

  SMPP_ACCOUNTS_UPDATE:
    "smpp_accounts.update",

  // ==========================================================================
  // Users
  // ==========================================================================

  USERS_ACTIVATE:
    "users.activate",

  USERS_CREATE:
    "users.create",

  USERS_DEACTIVATE:
    "users.deactivate",

  USERS_DELETE:
    "users.delete",

  USERS_LOCK:
    "users.lock",

  USERS_READ:
    "users.read",

  USERS_ROLES_UPDATE:
    "users.roles.update",

  USERS_UNLOCK:
    "users.unlock",

  USERS_UPDATE:
    "users.update",

  // ==========================================================================
  // Webhooks
  //
  // These permission names intentionally use ":" because that is how they
  // currently exist in the authoritative permission set.
  // ==========================================================================

  WEBHOOKS_CREATE:
    "webhooks:create",

  WEBHOOKS_DELETE:
    "webhooks:delete",

  WEBHOOKS_DELIVERIES_READ:
    "webhooks:deliveries:read",

  WEBHOOKS_READ:
    "webhooks:read",

  WEBHOOKS_ROTATE_SECRET:
    "webhooks:rotate-secret",

  WEBHOOKS_UPDATE:
    "webhooks:update",

} as const;

export type PermissionName =
  typeof PERMISSIONS[
  keyof typeof PERMISSIONS
  ];