"use client";

import { deleteManyClasses } from "@/actions/academic/class.actions";
import { useCrud } from "@/hooks/useCrud";
import { Class } from "@/types/class.types";
import { Text } from "@mantine/core";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";
import ClassForm from "./ClassForm/ClassForm";
import { RowActionMenu } from "./RowActionMenu";
import { BulkActionMenu } from "./ClassesBulkActionMenu";
import { classesTableColumns } from "./classesTableColumns";
import ClassCard from "./ClassCard";
import { PaginatedResponse } from "@/types/data-view.types";

type Props = {
  data: PaginatedResponse<Class>;
};

export default function ClassesData({ data }: Props) {
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
  } = useCrud<Class>({
    deleteAction: deleteManyClasses,
  });

  return (
    <>
      <DataView<Class>
        data={data || []}
        itemKey="items"
        openNewModal={{
          func: handleCreate,
          label: "Nova Turma",
        }}
        baseUrl="/system/academic/classes/"
        pageTitle="Turmas"
        RenderRowMenu={(item) => (
          <RowActionMenu
            classItem={item}
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
        columns={classesTableColumns}
        renderCard={(item) => (
          <ClassCard
            item={item}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
          />
        )}
      />

      <ClassForm
        opened={modals.create}
        onClose={closeModals.create}
      />

      {selectedItem && modals.update && (
        <ClassForm
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
          ? `Tem certeza de que deseja excluir ${idsToDelete.length} turma(s)?`
          : `Tem certeza de que deseja excluir a turma ${selectedItem?.name}?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Esta ação não pode ser desfeita.
        </Text>
      </ConfirmationModal>
    </>
  );
}