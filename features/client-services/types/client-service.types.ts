export const CLIENT_SERVICE_STATUSES = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type ClientServiceStatus =
  (typeof CLIENT_SERVICE_STATUSES)[keyof typeof CLIENT_SERVICE_STATUSES];

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

export interface ClientService {
  id: string;

  clientId: string;

  serviceId: string;

  serviceCode: string;

  serviceName: string;

  serviceCategory: ServiceCategory;

  serviceStatus: ServiceStatus;

  status: ClientServiceStatus;

  configuration: Record<string, unknown> | null;

  enabledAt: string | null;

  disabledAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface ClientServiceListParams {
  page?: number;

  pageSize?: number;

  search?: string;

  status?: ClientServiceStatus;

  sort?: string;
}

export interface ClientServiceListMeta {
  page: number;

  pageSize: number;

  total: number;

  totalPages: number;
}

export interface ClientServiceListResponse {
  items: ClientService[];

  meta: ClientServiceListMeta;
}

export interface CreateClientServicePayload {
  serviceCode: string;

  configuration?: Record<string, unknown>;
}

export interface UpdateClientServicePayload {
  configuration?: Record<string, unknown>;
}