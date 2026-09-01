export const PERMISSIONS = {
  API_KEYS_CREATE: "api_keys.create",
  API_KEYS_READ: "api_keys.read",
  API_KEYS_REVOKE: "api_keys.revoke",

  AUDIT_LOGS_READ: "audit_logs.read",

  CLIENTS_ACTIVATE: "clients.activate",
  CLIENTS_CREATE: "clients.create",
  CLIENTS_DELETE: "clients.delete",
  CLIENTS_DISABLE: "clients.disable",
  CLIENTS_READ: "clients.read",
  CLIENTS_SUSPEND: "clients.suspend",
  CLIENTS_UPDATE: "clients.update",

  FLOAT_ADJUST: "float.adjust",
  FLOAT_DEBIT: "float.debit",
  FLOAT_READ: "float.read",
  FLOAT_REFUND: "float.refund",
  FLOAT_TOP_UP: "float.top_up",

  MESSAGES_CREATE: "messages.create",
  MESSAGES_READ: "messages.read",

  PERMISSIONS_READ: "permissions.read",

  ROLES_CREATE: "roles.create",
  ROLES_DELETE: "roles.delete",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",

  SENDER_IDS_APPROVE: "sender_ids.approve",
  SENDER_IDS_CREATE: "sender_ids.create",
  SENDER_IDS_DEFAULT_UPDATE: "sender_ids.default.update",
  SENDER_IDS_DELETE: "sender_ids.delete",
  SENDER_IDS_DISABLE: "sender_ids.disable",
  SENDER_IDS_READ: "sender_ids.read",
  SENDER_IDS_REJECT: "sender_ids.reject",
  SENDER_IDS_UPDATE: "sender_ids.update",

  SMPP_ACCOUNTS_ACTIVATE: "smpp_accounts.activate",
  SMPP_ACCOUNTS_CREATE: "smpp_accounts.create",
  SMPP_ACCOUNTS_DISABLE: "smpp_accounts.disable",
  SMPP_ACCOUNTS_PASSWORD_UPDATE:
    "smpp_accounts.password.update",
  SMPP_ACCOUNTS_READ: "smpp_accounts.read",
  SMPP_ACCOUNTS_UPDATE: "smpp_accounts.update",

  USERS_ACTIVATE: "users.activate",
  USERS_CREATE: "users.create",
  USERS_DEACTIVATE: "users.deactivate",
  USERS_DELETE: "users.delete",
  USERS_READ: "users.read",
  USERS_ROLES_UPDATE: "users.roles.update",
  USERS_UNLOCK: "users.unlock",
  USERS_UPDATE: "users.update",

  WEBHOOKS_CREATE: "webhooks:create",
  WEBHOOKS_DELETE: "webhooks:delete",
  WEBHOOKS_DELIVERIES_READ:
    "webhooks:deliveries:read",
  WEBHOOKS_READ: "webhooks:read",
  WEBHOOKS_ROTATE_SECRET:
    "webhooks:rotate-secret",
  WEBHOOKS_UPDATE: "webhooks:update",
} as const;

export type PermissionName =
  typeof PERMISSIONS[
  keyof typeof PERMISSIONS
  ];