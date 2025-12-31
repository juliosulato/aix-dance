import { notifications } from "@mantine/notifications";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";

interface BaseEntity {
  id: string;
  [key: string]: any;
}

interface UseCrudOptions<_T> {
  onSuccess?: () => void;
}

export function useCrud<T extends BaseEntity>(options?: UseCrudOptions<T>) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isUpdateOpen, setUpdateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const path = usePathname();

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setCreateOpen(true);
  }, []);

  const handleUpdate = useCallback((item: T) => {
    setSelectedItem(item);
    setUpdateOpen(true);
  }, []);

  const handleDelete = useCallback((item: T) => {
    setSelectedItem(item);
    setIdsToDelete([]); 
    setDeleteOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setSelectedItem(null);
    setIdsToDelete(ids);
    setDeleteOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setCreateOpen(false);
    setUpdateOpen(false);
    setDeleteOpen(false);
    setSelectedItem(null);
    setIdsToDelete([]);
  }, []);

  const confirmDelete = async (
    deleteApiFunction: (ids: string[], tenancyId: string) => Promise<any>,
    tenancyId: string | undefined,
    mutate?: () => Promise<any>
  ) => {
    setIsDeleting(true);

    if (!tenancyId) {
        setIsDeleting(false);
        return;
    }

    const finalIdsToDelete = idsToDelete.length > 0 
      ? idsToDelete 
      : (selectedItem ? [selectedItem.id] : []);

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setDeleteOpen(false);
      return;
    }

    try {
      await deleteApiFunction(finalIdsToDelete, tenancyId);
      if (mutate) {
        await mutate();
        if (options?.onSuccess) options.onSuccess();
      } else {
        window.location.replace(path + "?notification=delete-success");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      notifications.show({
        title: "Erro",
        message: "Não foi possível excluir o(s) item(ns).",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setSelectedItem(null);
      setIdsToDelete([]);
    }
  };

  return {
    selectedItem,
    idsToDelete,
    isDeleting,
    modals: {
      create: isCreateOpen,
      update: isUpdateOpen,
      delete: isDeleteOpen,
    },
    setModals: {
        setCreate: setCreateOpen,
        setUpdate: setUpdateOpen,
        setDelete: setDeleteOpen
    },
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    confirmDelete,
    closeAll,
  };
}