"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { deleteBanks } from "@/actions/financial/banks/delete";
import { Bank } from "@/types/bank.types";
import UpdateBankAccount from "./UpdateBankAccount";
import { useCrud } from "@/hooks/useCrud";
import { GetSession } from "@/lib/auth-types";
import { Text } from "@mantine/core";

export default function BanksView({
  bank,
  session,
}: {
  bank: Bank;
  session: GetSession;
}) {
  const router = useRouter();

  const crud = useCrud<Bank>();

  const onConfirmDelete = () => {
    crud.confirmDelete(
      (ids, tId) => deleteBanks(ids),
      session?.data?.user?.tenancyId
    );
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Conta Bancária
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            // O hook já popula o selectedItem e abre o modal
            onClick={() => crud.handleDelete(bank)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            // O hook popula o selectedItem e abre o modal de update
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
          }).format(bank?.maintenanceFeeAmount?.toNumber() || 0)}
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
        <UpdateBankAccount
          bankAccount={crud.selectedItem}
          onClose={() => crud.setModals.setUpdate(false)}
          opened={crud.modals.update}
        />
      )}

      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={() => crud.setModals.setDelete(false)}
        onConfirm={onConfirmDelete}
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
