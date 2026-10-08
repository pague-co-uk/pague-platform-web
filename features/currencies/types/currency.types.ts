export interface Currency {
  id: string;
  code: string;
  numericCode: string | null;
  name: string;
  symbol: string | null;
  decimalDigits: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  sort?: string;
}

export interface CurrencyListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CurrencyListResponse {
  items: Currency[];
  meta: CurrencyListMeta;
}

export interface CreateCurrencyPayload {
  code: string;
  numericCode?: string;
  name: string;
  symbol?: string;
  decimalDigits?: number;
}

export interface UpdateCurrencyPayload {
  name?: string;
  symbol?: string;
  decimalDigits?: number;
}