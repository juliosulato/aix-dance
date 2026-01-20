import { Dispatch } from "react";
import { KeyedMutator } from "swr";

export interface BaseEntity {
  id: string;
  [key: string]: any;
}

export interface UseCrudOptions<T> {
  deleteAction?: (ids: string[]) => Promise<any>;
  mutate?: KeyedMutator<T[]>;
  redirectUrl?: string;
}


export type CrudHandlers<T> = {
  selectedItem: T | null;
  idsToDelete: string[];
  isDeleting: boolean;

  modals: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  formVersion: number;

  setModals: {
    setCreate: (value: boolean) => void;
    setUpdate: (value: boolean) => void;
    setDelete: (value: boolean) => void;
  };

  setSelectedItem: (item: T | null) => void;

  handleCreate: () => void;
  handleUpdate: (item: T) => void;
  handleDelete: (item: T) => void;
  handleBulkDelete: (ids: string[]) => void;

  confirmDelete: () => Promise<void>;

  closeModals: {
    create: () => void;
    update: () => void;
    delete: () => void;
  }

  pages: {
    page: number;
    setPage: Dispatch<number>;

    limit: number;
    setLimit: Dispatch<number>;

    setSortKey: Dispatch<string>;
    setSortDir: Dispatch<"asc" | "desc" | null>;
  }
};
