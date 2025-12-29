"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteBanks from "../delete";
import { Bank } from "@/types/bank.types";
import UpdateBankAccount from "../modals/updateBankAccount";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { useSession } from "@/lib/auth-client";

export default function BanksView({ id }: { id: string }) {
  const session = useSession();
  const tenancyId = session?.data?.user.tenancyId as string;

  const { data: bank, error } = useSWR<Bank>(
    `/api/v1/tenancies/${tenancyId}/banks/${id}`,
    fetcher
  );

  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBanks([bank?.id || "-"], tenancyId);
      window.location.replace("/system/financial/bank-accounts");
    } catch (error) {
      console.error("Falha ao excluir a forma de pagamento:", error);
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  if (error) {
    console.error("Falha ao carregar os dados da conta bancária:", error);
    return <div>Falha ao carregar os dados da conta bancária.</div>;
  }

  if (!bank) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Conta Bancária
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setConfirmModalOpen(true)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setOpenUpdate(true)}
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
          {Number(bank.maintenanceFeeAmount || 0)
            ?.toFixed(2)
            .replace(/\./g, ",")}
        </InfoTerm>
        <InfoTerm label={"Vencimento da Taxa"}>
          {Number(bank.maintenanceFeeDue)}
        </InfoTerm>
        <InfoTerm
          label={"Descrição"}
          className="md:col-span-2 lg:col-span-3 mt-5"
        >
          {bank.description}
        </InfoTerm>
      </div>

      <UpdateBankAccount
        bankAccount={bank}
        onClose={() => setOpenUpdate(false)}
        opened={openUpdate}
        mutate={() => window.location.reload()}
      />
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        confirmLabel="Sim, Excluir"
        confirmColor="red"
        loading={isDeleting}
      >
        {`Tem certeza que deseja excluir a conta bancária "${
          bank?.name || ""
        }"? Esta ação não pode ser desfeita.`}
      </ConfirmationModal>
    </div>
  );
}
