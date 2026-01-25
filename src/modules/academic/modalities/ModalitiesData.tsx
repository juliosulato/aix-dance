"use client";

import { deleteManyModalities } from "@/actions/academic/modality.actions";
import { useCrud } from "@/hooks/useCrud";
import { Modality } from "@/types/class.types";
import { Text } from "@mantine/core";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";
import ModalityForm from "./ModalityForm";
import { RowActionMenu } from "./RowActionMenu";
import { BulkActionMenu } from "./ModalitiesBulkActionMenu";
import { modalitiesTableColumns } from "./modalitiesTableColumns";
import ModalityCard from "./ModalityCard";
import { PaginatedResponse } from "@/types/data-view.types";

type Props = {
  data: PaginatedResponse<Modality>;
};

export default function ModalitiesData({ data }: Props) {
  const {
    selectedItem,
    idsToDelete,
    isDeleting,
    modals,
    closeModals,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    confirmDelete,
  } = useCrud<Modality>({
    deleteAction: deleteManyModalities,
  });

  return (
    <>
      <DataView<Modality>
        data={data || []}
        itemKey="items"
        openNewModal={{
          func: handleCreate,
          label: "Nova Modalidade",
        }}
        baseUrl="/system/academic/modalities/"
        pageTitle="Modalidades"
        RenderRowMenu={(item) => (
          <RowActionMenu
            modality={item}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <BulkActionMenu
            selectedIds={selectedIds}
            onBulkDelete={handleBulkDelete}
          />
        )}
        columns={modalitiesTableColumns}
        renderCard={(item) => (
          <ModalityCard
            item={item}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
          />
        )}
      />

      <ModalityForm
        opened={modals.create}
        onClose={closeModals.create}
      />

      {selectedItem && modals.update && (
        <ModalityForm
          opened={modals.update}
          onClose={closeModals.update}
          isEditing={selectedItem}
        />
      )}

      <ConfirmationModal
        opened={modals.delete}
        onClose={closeModals.delete}
        onConfirm={confirmDelete}
        title="Confirmação de Exclusão"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? `Tem certeza de que deseja excluir ${idsToDelete.length} modalidade(s)?`
          : `Tem certeza de que deseja excluir a modalidade ${selectedItem?.name}?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Esta ação não pode ser desfeita.
        </Text>
      </ConfirmationModal>
    </>
  );
}
