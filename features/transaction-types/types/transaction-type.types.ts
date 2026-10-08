export interface TransactionType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTypeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  sort?: string;
}

export interface TransactionTypeListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TransactionTypeListResponse {
  items: TransactionType[];
  meta: TransactionTypeListMeta;
}

export interface CreateTransactionTypePayload {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateTransactionTypePayload {
  name?: string;
  description?: string;
}