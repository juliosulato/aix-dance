import { notifications } from "@mantine/notifications";
import { useState, useCallback } from "react";
import { KeyedMutator } from "swr";

interface BaseEntity {
  id: string;
  [key: string]: any;
}

interface UseCrudOptions<T> {
  deleteAction?: (ids: string[]) => Promise<any>;
  mutate?: KeyedMutator<T>;
}

export function useCrud<T extends BaseEntity>({ mutate, deleteAction }: UseCrudOptions<T> = {}) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isUpdateOpen, setUpdateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteAction) {
      console.error("Nenhuma deleteAction forneceida para o useCrud.");
      return;
    }
    setIsDeleting(true);

    const finalIdsToDelete = idsToDelete.length > 0 
      ? idsToDelete 
      : (selectedItem ? [selectedItem.id] : []);

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setDeleteOpen(false);
      return;
    }

    try {
      await deleteAction(finalIdsToDelete);
      mutate?.()

      notifications.show({
        title: "Sucesso",
        message: "Item(ns) excluído(s) com sucesso.",
        color: "green",
      });

      closeAll();
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