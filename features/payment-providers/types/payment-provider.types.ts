export const PAYMENT_PROVIDER_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type PaymentProviderStatus =
  (typeof PAYMENT_PROVIDER_STATUSES)[keyof typeof PAYMENT_PROVIDER_STATUSES];

export interface PaymentProvider {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: PaymentProviderStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PaymentProviderStatus;
  sort?: string;
}

export interface PaymentProviderListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaymentProviderListResponse {
  items: PaymentProvider[];
  meta: PaymentProviderListMeta;
}

export interface CreatePaymentProviderPayload {
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentProviderPayload {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}