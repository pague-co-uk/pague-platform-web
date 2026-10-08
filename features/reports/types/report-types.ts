export type MessageReportRow = {
  readonly publicId: string;
  readonly destination: string;
  readonly sender: string | null;
  readonly encoding: string;
  readonly segmentCount: number;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly createdAt: string;
};

export type RoutePerformanceReportRow = {
  readonly publicId: string;
  readonly connectorName: string;
  readonly status: string;
  readonly attempts: number;
};

export type FloatLedgerReportRow = {
  readonly publicId: string;
  readonly transactionType: string;
  readonly credits: number;
  readonly referenceType: string;
  readonly referenceId: string | null;
  readonly description: string | null;
  readonly createdAt: string;
};

export type ReportPagination = {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
};

export type MessageReportResponse = {
  readonly success: boolean;
  readonly data: MessageReportRow[];
  readonly pagination: ReportPagination;
  readonly meta?: Record<string, unknown>;
};

export type RoutePerformanceReportResponse = {
  readonly success: boolean;
  readonly data: RoutePerformanceReportRow[];
  readonly pagination: ReportPagination;
  readonly meta?: Record<string, unknown>;
};

export type FloatLedgerReportResponse = {
  readonly success: boolean;
  readonly data: FloatLedgerReportRow[];
  readonly pagination: ReportPagination;
  readonly meta?: Record<string, unknown>;
};

// ============================================================================
// Transactions
// ============================================================================

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED"
  | "CANCELLED";

export interface TransactionReportRow {
  readonly publicId: string;

  readonly clientName: string;

  readonly serviceCode: string;

  readonly serviceName: string;

  readonly providerCode: string | null;

  readonly providerName: string | null;

  readonly providerServiceCode: string | null;

  readonly providerServiceExternalCode: string | null;

  readonly currencyCode: string;

  readonly currencyName: string;

  readonly currencySymbol: string | null;

  readonly transactionTypeCode: string;

  readonly transactionTypeName: string;

  readonly status: TransactionStatus;

  readonly reference: string;

  readonly providerReference: string | null;

  readonly amount: string;

  readonly description: string | null;

  readonly processedAt: string | null;

  readonly createdAt: string;
}