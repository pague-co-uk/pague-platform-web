export interface PaginationQuery {
  page: number;

  pageSize: number;
}

export interface PaginationMeta {
  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;

  hasNext: boolean;

  hasPrevious: boolean;
}