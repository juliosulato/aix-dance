export type PaginatedListResponse<T> = {
  items?: T[];
  students?: T[];
  products?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
};

export function extractItemsFromResponse<T>(
  response: T[] | PaginatedListResponse<T> | null | undefined
): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.students)) return response.students;
  if (Array.isArray(response.products)) return response.products;

  return [];
}
