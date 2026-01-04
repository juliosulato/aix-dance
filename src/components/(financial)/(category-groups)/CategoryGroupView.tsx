"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { CategoryGroup } from "@/types/category.types";
import { useCrud } from "@/hooks/useCrud";
import { deleteCategoryGroups } from "@/actions/financial/categoryGroups/delete";
import CategoryGroupFormModal from "./CategoryGroupFormModal";

type Props = {
  categoryGroup: CategoryGroup;
};

export default function CategoryGroupView({ categoryGroup }: Props) {
  const crud = useCrud({ deleteAction: deleteCategoryGroups, redirectUrl: `/system/financial/category-groups` });

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Detalhes do Grupo
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleDelete(categoryGroup)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleUpdate(categoryGroup)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoTerm label={"Nome"}>{categoryGroup.name}</InfoTerm>

        <CategoryGroupFormModal
          key={`update-${crud.formVersion}`}
          selectedItem={categoryGroup}
          onClose={crud.closeModals.update}
          opened={crud.modals.update}
        />
        <ConfirmationModal
          opened={crud.modals.delete}
          onClose={crud.closeModals.delete}
          onConfirm={crud.confirmDelete}
          title="Confirmar Exclusão"
          confirmLabel="Sim, Excluir"
          confirmColor="red"
          loading={crud.isDeleting}
        >
          {`Deseja realmente excluir o grupo ${
            categoryGroup?.name || ""
          }? Esta ação não poderá ser desfeita.`}
        </ConfirmationModal>
      </div>
    </div>
  );
}
