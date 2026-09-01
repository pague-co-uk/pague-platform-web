export type UserStatus =
  | "ACTIVE"
  | "LOCKED"
  | "DISABLED";

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: readonly PermissionResponse[];
}

export interface UserSummary {
  id: string;
  clientId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  locked: boolean;
  mfaEnabled: boolean;
}

export interface User extends UserSummary {
  roles: readonly RoleResponse[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  items: readonly UserSummary[];
  meta: PaginationMeta;
}