import "server-only";

export interface DashboardData {
  messaging: DashboardMessagingSummary;

  float: DashboardFloatSummary;

  activity: readonly DashboardActivityPoint[];

  alerts: readonly DashboardAlert[];

  operational: DashboardOperationalStatus;
}

export interface DashboardMessagingSummary {
  sent: number;

  delivered: number;

  failed: number;

  deliveryRate: number;
}

export interface DashboardFloatSummary {
  balance: string;

  currency: string;
}

export interface DashboardActivityPoint {
  timestamp: string;

  sent: number;

  delivered: number;

  failed: number;
}

export interface DashboardAlert {
  id: string;

  title: string;

  description: string;

  severity:
  | "info"
  | "warning"
  | "critical";

  href?: string;
}

export interface DashboardOperationalStatus {
  messaging:
  | "operational"
  | "degraded"
  | "outage";

  routing:
  | "operational"
  | "degraded"
  | "outage";

  webhooks:
  | "operational"
  | "degraded"
  | "outage";
}