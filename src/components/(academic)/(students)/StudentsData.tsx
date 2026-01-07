"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import { LoadingOverlay, Text } from "@mantine/core";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView"; // Assumindo que DataView é genérico o suficiente

import "dayjs/locale/pt-br";
import { StudentComplete } from "@/types/student.types";
import StudentForm from "./StudentForm/StudentForm";
import { useCrud } from "@/hooks/useCrud"; // Ajuste o caminho do seu hook
import { deleteStudents } from "@/actions/academic/student/delete"; // Importe a server action criada acima
import { RowActionMenu } from "./RowActionMenu";
import { BulkActionMenu } from "./StudentsBulkActionMenu";
import { studentsTableColumns } from "./studentsTableColumns";
import StudentCard from "./StudentCard";

export default function StudentsList() {
  const { data: sessionData } = useSession();

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);


  const {
    data: studentsData,
    error,
    isLoading,
    mutate,
  } = useSWR<PaginatedResponseLocal<StudentComplete>>(
    () =>
      sessionData?.user?.tenancyId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/students?page=${page}&limit=${limit}`
        : null,
    fetcher
  );

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
  } = useCrud<StudentComplete>({
    mutate: mutate as unknown as KeyedMutator<StudentComplete[]>,
    deleteAction: async (ids) => {
      if (sessionData?.user?.tenancyId) {
        await deleteStudents(ids);
      }
    },
  });

  if (isLoading) return <LoadingOverlay visible />;
  if (error) return <p>Erro ao carregar dados.</p>;

  return (
    <>
      <DataView<StudentComplete>
        data={studentsData?.data || []} 
        itemKey="items"
        openNewModal={{
          func: handleCreate,
          label: "Novo Aluno",
        }}
        baseUrl="/system/academic/students/"
        mutate={mutate}
        pageTitle="Alunos e Matrículas"
        searchbarPlaceholder="Procure por nome, CPF ou e-mail..."
        onPageChange={(page, limit) => {
          setPage(page);
          setLimit(limit)
        }}
        RenderRowMenu={(item) => (
          <RowActionMenu
            student={item}
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
        columns={studentsTableColumns}
        renderCard={(item) => <StudentCard item={item} handleDelete={handleDelete} handleUpdate={handleUpdate}/>}
      />

      <StudentForm
        opened={modals.create}
        onClose={closeModals.create}
        mutate={mutate as any} 
      />

      {selectedItem && modals.update && (
        <StudentForm
          opened={modals.update}
          onClose={closeModals.update}
          isEditing={selectedItem}
          mutate={mutate as any}
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
          ? `Tem certeza de que deseja excluir ${idsToDelete.length} aluno(s)?`
          : `Tem certeza de que deseja excluir o aluno ${selectedItem?.firstName} ${selectedItem?.lastName}?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Esta ação não pode ser desfeita.
        </Text>
      </ConfirmationModal>
    </>
  );
}
