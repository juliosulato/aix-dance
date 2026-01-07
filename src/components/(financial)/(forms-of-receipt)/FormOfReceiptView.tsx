"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { FormsOfReceipt } from "@/types/receipt.types";
import { useCrud } from "@/hooks/useCrud";
import { deleteFormOfReceipt } from "@/actions/formsOfReceipt.actions";
import FormsOfReceiptModal from "./FormsOfReceiptModal";

type Props = {
  formOfReceipt: FormsOfReceipt;
};

export default function FormOfReceiptView({ formOfReceipt }: Props) {
  const crud = useCrud<FormsOfReceipt>({ deleteAction: deleteFormOfReceipt, redirectUrl: "/system/financial/forms-of-receipt" });
  
  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Detalhes da Forma de Recebimento
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleDelete(formOfReceipt)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleUpdate(formOfReceipt)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoTerm label={"Nome"}>{formOfReceipt.name}</InfoTerm>
        <InfoTerm label={"Operadora"}>{formOfReceipt.operator}</InfoTerm>
       {formOfReceipt && (
          <>
          <h2 className="md:col-span-2 lg:col-span-3 font-bold text-xl my-4">
            Taxas
          </h2>
        {formOfReceipt?.fees?.map((fee) => (
          <div
            className="grid gap-4 md:grid-cols-2 md:col-span-2 lg:col-span-3"
            key={fee.id}
          >
            <InfoTerm label={"Mínimo de Parcelas"}>
              {fee.minInstallments}
            </InfoTerm>
            <InfoTerm label={"Máximo de Parcelas"}>
              {fee.maxInstallments}
            </InfoTerm>
            <InfoTerm label={"Percentual"}>{`${fee.feePercentage
              .toFixed(2)
              .replace(/\./g, ",")}%`}</InfoTerm>
            <InfoTerm
              label={"Recebe em (dias)"}
            >{`${fee.receiveInDays}`}</InfoTerm>
            <InfoTerm label={"Juros ao Cliente"}>
              {fee.customerInterest ? "Sim" : "Não"}
            </InfoTerm>
          </div>
        ))}
          </>
       )}
      </div>

      <FormsOfReceiptModal
        key={`update-${crud.formVersion}`}
        selectedItem={formOfReceipt}
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
        Você tem certeza que deseja excluir a forma de pagamento
        <strong className="mx-1">{formOfReceipt.name}</strong>? Esta ação não
        poderá ser desfeita.
      </ConfirmationModal>
    </div>
  );
}
