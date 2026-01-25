  type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  type PaginatedResponseLocal<T> = { data: {
    items: T[] | []
  }; pagination: PaginationInfo };
