import type {
  DashboardPeriodValue,
} from "./dashboard";

export type {
  DashboardPeriodValue
} from "./dashboard";

export interface PaymentDashboardViewer {
  readonly userId: string;
  readonly scope: "PLATFORM" | "CLIENT";
  readonly clientId: string | null;
  readonly clientName: string | null;
}

export interface PaymentDashboardPeriod {
  readonly start: string;
  readonly end: string;
  readonly days: number;
}

export interface PaymentDashboardSummary {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly processing: number;
  readonly pending: number;
  readonly reversed: number;
  readonly cancelled: number;
  readonly successRate: number;
}

export interface PaymentTransactionTrendPoint {
  readonly date: string;
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
}

export interface PaymentStatusBreakdown {
  readonly status: string;
  readonly count: number;
  readonly percentage: number;
}

export interface PaymentCurrencyVolume {
  readonly currencyId: string;
  readonly currencyCode: string;
  readonly currencyName: string;
  readonly currencySymbol: string | null;
  readonly transactionCount: number;
  readonly totalAmount: string;
}

export interface PaymentProviderPerformance {
  readonly providerId: string | null;
  readonly providerCode: string | null;
  readonly providerName: string | null;
  readonly transactionCount: number;
  readonly successful: number;
  readonly failed: number;
  readonly successRate: number;
}

export interface PaymentTransactionTypeBreakdown {
  readonly transactionTypeId: string;
  readonly transactionTypeCode: string;
  readonly transactionTypeName: string;
  readonly transactionCount: number;
  readonly successful: number;
  readonly failed: number;
  readonly successRate: number;
}

export interface PaymentDashboardTransaction {
  readonly id: string;
  readonly publicId: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly serviceCode: string;
  readonly serviceName: string;
  readonly providerCode: string | null;
  readonly providerName: string | null;
  readonly currencyCode: string;
  readonly currencySymbol: string | null;
  readonly transactionTypeCode: string;
  readonly transactionTypeName: string;
  readonly status: string;
  readonly reference: string;
  readonly amount: string;
  readonly createdAt: string;
}

export interface PaymentDashboardData {
  readonly viewer: PaymentDashboardViewer;
  readonly period: PaymentDashboardPeriod;
  readonly summary: PaymentDashboardSummary;
  readonly transactionTrend: PaymentTransactionTrendPoint[];
  readonly statusBreakdown: PaymentStatusBreakdown[];
  readonly currencyVolume: PaymentCurrencyVolume[];
  readonly providerPerformance: PaymentProviderPerformance[];
  readonly transactionTypes: PaymentTransactionTypeBreakdown[];
  readonly recentTransactions: PaymentDashboardTransaction[];
}

// Keep the imported type referenced explicitly so the file's public
// contract remains tied to the existing dashboard period values.
export type PaymentDashboardPeriodValue =
  DashboardPeriodValue;