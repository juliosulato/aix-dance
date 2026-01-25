export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponseLocal<T> = {
  data: {
    items: T[] | [];
  }
  pagination: PaginationInfo;
};
