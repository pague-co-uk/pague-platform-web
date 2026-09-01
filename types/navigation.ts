export type NavigationBadgeVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface NavigationBadge {
  value: number | string;

  variant?: NavigationBadgeVariant;
}

export interface NavigationItem {
  id: string;

  label: string;

  href: string;

  icon: string;

  badge?: NavigationBadge;

  children?: NavigationItem[];
}