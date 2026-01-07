import { ComboboxData } from "@mantine/core";
import React from "react";

export type SortDirection = "asc" | "desc";
export type SortConfig<T> = { key: keyof T; direction: SortDirection };

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  pagination: PaginationInfo;
  [key: string]: PaginationInfo | T[] | undefined;
}

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number; 
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: any, item: T) => React.ReactNode;
};

export type FilterType = "text" | "select" | "date" | "boolean";

export interface AdvancedFilter<T> {
  key: keyof T | string;
  label: string;
  type: FilterType;
  options?: ComboboxData;
  defaultValue?: any;
}

export type ActiveFilters = Record<string, any>;