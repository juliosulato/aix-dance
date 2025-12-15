"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FormsOfReceipt } from "..";
import { FaEdit, FaTrash } from "react-icons/fa";
import deleteFormsOfReceipt from "../deleteFormsOfReceipt";
import UpdateFormsOfReceipt from "../modals/updateFormsOfReceipt";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export default function FormsOfReceiptView({ id }: { id: string }) {

    const session = useSession();
    const tenancyId = session?.data?.user.tenancyId as string;

    const { data: formsOfReceipt, error } = useSWR<FormsOfReceipt>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/forms-of-receipt/${id}`,
        fetcher
    );

    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteFormsOfReceipt([formsOfReceipt?.id ?? "-"], tenancyId);
            window.location.replace("/system/financial/forms-of-receipt");
        } catch (error) {
            console.error("Falha ao excluir a forma de pagamento:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    if (error) {
        console.error("Falha ao carregar os dados da forma de pagamento:", error);
        return <div>Falha ao carregar os dados da forma de pagamento.</div>;
    }
    
    if (!formsOfReceipt) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">Detalhes da Forma de Recebimento</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{"Excluir"}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{"Atualizar"}</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Nome"}>{formsOfReceipt.name}</InfoTerm>
                <InfoTerm label={"Operadora"}>{formsOfReceipt.operator}</InfoTerm>
                {formsOfReceipt.fees.length > 0 && <h2 className="md:col-span-2 lg:col-span-3 font-bold text-xl my-4">Taxas</h2>}
                {formsOfReceipt.fees.map((fee) => (
                     <div className="grid gap-4 md:grid-cols-2 md:col-span-2 lg:col-span-3" key={fee.id}>
                        <InfoTerm label={"Mínimo de Parcelas"}>{fee.minInstallments}</InfoTerm>
                        <InfoTerm label={"Máximo de Parcelas"}>{fee.maxInstallments}</InfoTerm>
                        <InfoTerm label={"Percentual"}>{`${fee.feePercentage.toFixed(2).replace(/\./g, ",")}%`}</InfoTerm>
                        <InfoTerm label={"Recebe em (dias)"}>{`${fee.receiveInDays}`}</InfoTerm>
                        <InfoTerm label={"Juros ao Cliente"}>{fee.customerInterest ? "Sim" : "Não"}</InfoTerm>
                    </div>
                ))}
            </div>

            <UpdateFormsOfReceipt formsOfReceipt={formsOfReceipt} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload()} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                Você tem certeza que deseja excluir a forma de pagamento
                <strong className="mx-1">{formsOfReceipt.name}</strong>?
                Esta ação não poderá ser desfeita.
            </ConfirmationModal>
        </div>
    );
}