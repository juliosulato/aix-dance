"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Bank } from "@/types/bank.types";
import BankFormModal from "./BankFormModal";
import { useCrud } from "@/hooks/useCrud";
import { Text } from "@mantine/core";
import Decimal from "decimal.js";

export default function BankAccountView({ bank }: { bank: Bank }) {
  const crud = useCrud<Bank>();



  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Conta Bancária
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleDelete(bank)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleUpdate(bank)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoTerm label={"Nome"}>{bank.name}</InfoTerm>
        <InfoTerm label={"Agência"}>{bank.agency}</InfoTerm>
        <InfoTerm label={"Conta"}>{bank.account}</InfoTerm>
        <InfoTerm label={"Taxa de Manutenção (R$)"}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(bank?.maintenanceFeeAmount instanceof Decimal ? bank?.maintenanceFeeAmount?.toNumber() : bank.maintenanceFeeAmount || 0)}
        </InfoTerm>
        <InfoTerm label={"Vencimento da Taxa"}>
          {bank.maintenanceFeeDue || "-"}
        </InfoTerm>
        <InfoTerm
          label={"Descrição"}
          className="md:col-span-2 lg:col-span-3 mt-5"
        >
          {bank.description || "-"}
        </InfoTerm>
      </div>

      {crud.selectedItem && (
        <BankFormModal
          bankToEdit={crud.selectedItem}
          onClose={crud.closeModals.update}
          opened={crud.modals.update}
          key={`update-${crud.formVersion}`}
        />
      )}

      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={crud.closeModals.delete}
        onConfirm={crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {crud.idsToDelete.length > 0
          ? `Tem certeza que deseja excluir ${crud.idsToDelete.length} banco${
              crud.idsToDelete.length > 1 ? "s" : ""
            }?`
          : `Tem certeza que deseja excluir o banco "${
              crud.selectedItem?.name || ""
            }"?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação é irreversível."}
        </Text>
      </ConfirmationModal>
    </div>
  );
}
