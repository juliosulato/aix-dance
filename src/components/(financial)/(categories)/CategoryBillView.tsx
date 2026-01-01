"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import UpdateCategoryBill from "./UpdateCategoryBill";
import { useCrud } from "@/hooks/useCrud";
import { deleteCategoryBills } from "@/actions/financial/categoryBills/delete";
import { CategoryBill, CategoryGroup } from "@/types/category.types";

export default function CategoryBillView({
  categoryBill,
  categoryGroups,
  categoryBills,
}: {
  categoryBill: CategoryBill;
  categoryGroups: CategoryGroup[];
  categoryBills: CategoryBill[];
}) {
  const crud = useCrud({ deleteAction: deleteCategoryBills });

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          {categoryBill.name}
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleDelete}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleUpdate}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoTerm label={"Nome"}>{categoryBill.name}</InfoTerm>

        <UpdateCategoryBill
          selectedItem={categoryBill}
          onClose={() => crud.setModals.setUpdate(false)}
          opened={crud.modals.update}
          categoryGroups={categoryGroups}
          parentCategories={categoryBills}
        />

        <ConfirmationModal
          opened={crud.modals.delete}
          onClose={() => crud.setModals.setDelete(false)}
          onConfirm={() => crud.confirmDelete}
          title={"Confirmar Exclusão"}
          confirmLabel={"Excluir"}
          cancelLabel={"Cancelar"}
          loading={crud.isDeleting}
        >
          {`Tem certeza que deseja excluir o grupo "${
            crud.selectedItem?.name || ""
          }"?`}
        </ConfirmationModal>
      </div>
    </div>
  );
}
