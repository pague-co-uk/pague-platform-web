import { PaymentProviderStatus } from "@/features/payment-providers/types/payment-provider.types";

export const TRANSACTION_STATUSES = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REVERSED: "REVERSED",
  CANCELLED: "CANCELLED",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUSES)[keyof typeof TRANSACTION_STATUSES];

export interface Transaction {
  id: string;
  publicId: string;

  clientId: string;
  clientName: string;

  clientServiceId: string;
  serviceCode: string;
  serviceName: string;

  providerId: string | null;
  providerCode: string | null;
  providerName: string | null;
  providerStatus: PaymentProviderStatus | null;

  providerServiceId: string | null;
  providerServiceCode: string | null;
  providerServiceExternalCode: string | null;

  currencyId: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string | null;

  transactionTypeId: string;
  transactionTypeCode: string;
  transactionTypeName: string;

  status: TransactionStatus;

  reference: string;
  providerReference: string | null;

  amount: string;
  description: string | null;

  metadata: Record<string, unknown> | null;
  providerResponse: Record<string, unknown> | null;

  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TransactionStatus;
  clientId?: string;
  clientServiceId?: string;
  providerId?: string;
  providerServiceId?: string;
  currencyId?: string;
  transactionTypeId?: string;
  sort?: string;
}

export interface TransactionListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  meta: TransactionListMeta;
}