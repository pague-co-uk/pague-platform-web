export interface CountryCurrency {
  countryCode: string;
  countryName: string;
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  isPrimary: boolean;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CountryCurrencyListParams {
  page?: number;
  pageSize?: number;
  countryCode?: string;
  currencyId?: string;
  isPrimary?: boolean;
  isOfficial?: boolean;
  search?: string;
  sort?: string;
}

export interface CountryCurrencyListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CountryCurrencyListResponse {
  items: CountryCurrency[];
  meta: CountryCurrencyListMeta;
}

export interface CreateCountryCurrencyPayload {
  countryCode: string;
  currencyId: string;
  isPrimary?: boolean;
  isOfficial?: boolean;
}

export interface UpdateCountryCurrencyPayload {
  isPrimary?: boolean;
  isOfficial?: boolean;
}