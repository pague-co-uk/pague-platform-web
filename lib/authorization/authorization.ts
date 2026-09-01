import "server-only";

import type {
  CurrentUser,
} from "@/lib/auth/get-current-user";

// ============================================================================
// Permission
// ============================================================================

export function hasPermission(
  user: CurrentUser,
  permission: string,
): boolean {
  return user.roles.some(
    (role) =>
      role.permissions.some(
        (userPermission) =>
          userPermission.name ===
          permission,
      ),
  );
}

// ============================================================================
// Any permission
// ============================================================================

export function hasAnyPermission(
  user: CurrentUser,
  permissions: readonly string[],
): boolean {
  return permissions.some(
    (permission) =>
      hasPermission(
        user,
        permission,
      ),
  );
}

// ============================================================================
// All permissions
// ============================================================================

export function hasAllPermissions(
  user: CurrentUser,
  permissions: readonly string[],
): boolean {
  return permissions.every(
    (permission) =>
      hasPermission(
        user,
        permission,
      ),
  );
}

// ============================================================================
// Role
// ============================================================================

export function hasRole(
  user: CurrentUser,
  roleName: string,
): boolean {
  return user.roles.some(
    (role) =>
      role.name ===
      roleName,
  );
}

// ============================================================================
// Any role
// ============================================================================

export function hasAnyRole(
  user: CurrentUser,
  roles: readonly string[],
): boolean {
  return roles.some(
    (roleName) =>
      hasRole(
        user,
        roleName,
      ),
  );
}

// ============================================================================
// All roles
// ============================================================================

export function hasAllRoles(
  user: CurrentUser,
  roles: readonly string[],
): boolean {
  return roles.every(
    (roleName) =>
      hasRole(
        user,
        roleName,
      ),
  );
}

// ============================================================================
// Account state
// ============================================================================

export function isUserActive(
  user: CurrentUser,
): boolean {
  return (
    user.active &&
    !user.locked
  );
}