import { BaseEntity, CrudHandlers, UseCrudOptions } from "@/types/useCrud.types";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { GoCheckCircleFill } from "react-icons/go";
import { IoCloseCircle } from "react-icons/io5";

export function useCrud<T extends BaseEntity>({ mutate, redirectUrl, deleteAction }: UseCrudOptions<T> = {}): CrudHandlers<T> {
  const router = useRouter();

  const [formVersion, setFormVersion] = useState(0);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isUpdateOpen, setUpdateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setCreateOpen(true);
    setFormVersion((v) => v + 1);
  }, []);

  const handleUpdate = useCallback((item: T) => {
    setSelectedItem(item);
    setUpdateOpen(true);
    setFormVersion((v) => v + 1);
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

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const closeUpdate = useCallback(() => {
    setUpdateOpen(false);
    setSelectedItem(null); 
  }, []);

  const closeDelete = useCallback(() => {
    setDeleteOpen(false);
    setIdsToDelete([]);
  }, []);

  const confirmDelete = async () => {
    if (!deleteAction) {
      console.error("Nenhuma deleteAction forneceida para o useCrud.");
      return;
    }
    setIsDeleting(true);

    const finalIdsToDelete = idsToDelete.length > 0 
      ? idsToDelete : (selectedItem ? [selectedItem.id] : []);

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setDeleteOpen(false);
      return;
    }

    try {
      await deleteAction(finalIdsToDelete);
      mutate?.()
      
      if (redirectUrl) {
        router.replace(redirectUrl)
      }
      notifications.show({
        icon: <GoCheckCircleFill color="#12B886"/>,
        title: "Sucesso",
        message: "Item(ns) excluído(s) com sucesso.",
        color: "green",
      });
    } catch (error) {
      console.error("Erro ao excluir:", error);
      notifications.show({
        icon: <IoCloseCircle color="#FB8282"/>,
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
    formVersion, // <--- Importante para o key={}
    modals: {
      create: isCreateOpen,
      update: isUpdateOpen,
      delete: isDeleteOpen,
    },
    closeModals: {
      create: closeCreate,
      update: closeUpdate,
      delete: closeDelete,
    },
    setSelectedItem: setSelectedItem,
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
  };
}