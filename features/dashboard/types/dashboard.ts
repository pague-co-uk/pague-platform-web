// ============================================================================
// Dashboard period
// ============================================================================

export type DashboardPeriodValue =
  | "7d"
  | "30d"
  | "90d";

export interface DashboardPeriod {
  readonly start: string;

  readonly end: string;

  readonly days: number;
}

// ============================================================================
// Dashboard scope
// ============================================================================

export type DashboardScope =
  | "PLATFORM"
  | "CLIENT";

export interface DashboardViewer {
  readonly userId: string;

  readonly scope: DashboardScope;

  readonly clientId: string | null;

  readonly clientName: string | null;
}

// ============================================================================
// Message status
// ============================================================================

export type DashboardMessageStatus =
  | "QUEUED"
  | "ROUTED"
  | "SUBMITTED"
  | "DELIVERED"
  | "FAILED"
  | "EXPIRED";

// ============================================================================
// Client status
// ============================================================================

export type DashboardClientStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";

// ============================================================================
// Message summary
// ============================================================================

export interface DashboardMessageSummary {
  readonly total: number;

  readonly queued: number;

  readonly routed: number;

  readonly submitted: number;

  readonly delivered: number;

  readonly failed: number;

  readonly expired: number;

  readonly deliveryRate: number;
}

// ============================================================================
// KPI summary
// ============================================================================

export interface DashboardKpiSummary {
  readonly totalMessages: number;

  readonly delivered: number;

  readonly failed: number;

  readonly deliveryRate: number;

  readonly fifthMetric: {
    readonly label: string;

    readonly value: number;

    readonly formattedValue: string;
  };
}

// ============================================================================
// Message trend
// ============================================================================

export interface DashboardTrendPoint {
  readonly date: string;

  readonly sent: number;

  readonly delivered: number;

  readonly failed: number;

  readonly expired: number;
}

// ============================================================================
// Hourly message volume
// ============================================================================

export interface DashboardHourlyVolume {
  readonly day: number;

  readonly hour: number;

  readonly count: number;
}

// ============================================================================
// Status breakdown
// ============================================================================

export interface DashboardStatusBreakdown {
  readonly status: DashboardMessageStatus;

  readonly count: number;

  readonly percentage: number;
}

// ============================================================================
// Status / error-code breakdown
// ============================================================================

export interface DashboardStatusCodeBreakdown {
  readonly code: string;

  readonly label: string;

  readonly count: number;

  readonly percentage: number;
}

// ============================================================================
// Route performance
// ============================================================================

export interface DashboardRoutePerformance {
  readonly publicId: string;

  readonly connectorName: string;

  readonly attempts: number;

  readonly submitted: number;

  readonly delivered: number;

  readonly failed: number;

  readonly submissionRate: number;

  readonly deliveryRate: number;
}

// ============================================================================
// Float summary
// ============================================================================

export interface DashboardFloatSummary {
  readonly balance: number;

  readonly currency: string;

  readonly topUps: number;

  readonly debits: number;

  readonly refunds: number;

  readonly adjustments: number;
}

// ============================================================================
// Float trend
// ============================================================================

export interface DashboardFloatTrendPoint {
  readonly date: string;

  readonly topUps: number;

  readonly debits: number;

  readonly refunds: number;

  readonly adjustments: number;

  readonly net: number;
}

// ============================================================================
// Operational summary
// ============================================================================

export interface DashboardOperationalSummary {
  readonly scope: DashboardScope;

  readonly clients: {
    readonly active: number;

    readonly suspended: number;

    readonly disabled: number;
  };

  readonly smppAccounts: {
    readonly active: number;

    readonly suspended: number;

    readonly disabled: number;
  };

  readonly senderIds: {
    readonly pending: number;

    readonly approved: number;

    readonly rejected: number;

    readonly disabled: number;
  };

  readonly webhooks: {
    readonly active: number;

    readonly disabled: number;
  };
}

// ============================================================================
// Client summary
// ============================================================================

export interface DashboardClientSummary {
  readonly clientId: string;

  readonly publicId: string;

  readonly name: string;

  readonly status: DashboardClientStatus;

  readonly messages: number;

  readonly delivered: number;

  readonly failed: number;

  readonly deliveryRate: number;
}

// ============================================================================
// Recent activity
// ============================================================================

export interface DashboardActivityItem {
  readonly id: string;

  readonly action: string;

  readonly entityType: string;

  readonly entityId: string;

  readonly clientId: string | null;

  readonly clientName: string | null;

  readonly userId: string | null;

  readonly userName: string | null;

  readonly createdAt: string;
}

// ============================================================================
// Dashboard
// ============================================================================

export interface DashboardData {
  readonly viewer: DashboardViewer;

  readonly period: DashboardPeriod;

  readonly kpis: DashboardKpiSummary;

  readonly messages: DashboardMessageSummary;

  readonly messageTrend: readonly DashboardTrendPoint[];

  readonly hourlyVolume: readonly DashboardHourlyVolume[];

  readonly statusBreakdown: readonly DashboardStatusBreakdown[];

  readonly statusCodeBreakdown: readonly DashboardStatusCodeBreakdown[];

  readonly routePerformance: readonly DashboardRoutePerformance[];

  readonly float: DashboardFloatSummary;

  readonly floatTrend: readonly DashboardFloatTrendPoint[];

  readonly operational: DashboardOperationalSummary;

  readonly clients: readonly DashboardClientSummary[];

  readonly recentActivity: readonly DashboardActivityItem[];
}