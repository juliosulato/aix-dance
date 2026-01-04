export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponseLocal<T> = {
  bills: import("c:/Users/Mazza/Documents/GitHub/aix/aix-dance/src/types/bill.types").BillComplete[];
  products: T[];
  pagination: PaginationInfo;
};
