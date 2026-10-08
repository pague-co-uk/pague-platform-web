export const PAYMENT_PROVIDER_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type PaymentProviderStatus =
  (typeof PAYMENT_PROVIDER_STATUSES)[keyof typeof PAYMENT_PROVIDER_STATUSES];

export const SERVICE_CATEGORIES = {
  MESSAGING: "MESSAGING",
  PAYMENTS: "PAYMENTS",
} as const;

export type ServiceCategory =
  (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];

export const SERVICE_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type ServiceStatus =
  (typeof SERVICE_STATUSES)[keyof typeof SERVICE_STATUSES];

export interface ProviderService {
  id: string;

  providerId: string;
  providerCode: string;
  providerName: string;
  providerStatus: PaymentProviderStatus;

  serviceId: string;
  serviceCode: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  serviceStatus: ServiceStatus;

  externalServiceCode: string | null;
  configuration: Record<string, unknown> | null;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ProviderServiceListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  providerCode?: string;
  serviceCode?: string;
  sort?: string;
}

export interface ProviderServiceListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProviderServiceListResponse {
  items: ProviderService[];
  meta: ProviderServiceListMeta;
}

export interface CreateProviderServicePayload {
  providerCode: string;
  serviceCode: string;
  externalServiceCode?: string;
  configuration?: Record<string, unknown>;
}

export interface UpdateProviderServicePayload {
  externalServiceCode?: string;
  configuration?: Record<string, unknown>;
}