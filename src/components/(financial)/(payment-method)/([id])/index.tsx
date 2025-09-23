"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { FormsOfReceipt } from "..";
import { FaEdit, FaTrash } from "react-icons/fa";
import deleteFormsOfReceipt from "../deleteFormsOfReceipt";
import UpdateFormsOfReceipt from "../modals/updateFormsOfReceipt";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function FormsOfReceiptView({ formsOfReceipt, tenancyId }: { formsOfReceipt: FormsOfReceipt, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteFormsOfReceipt([formsOfReceipt.id], tenancyId);
            window.location.replace("/system/financial/forms-of-receipt");
        } catch (error) {
            console.error("Falha ao excluir a forma de pagamento:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };


    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{"Texto"}</h1>
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
                <InfoTerm label={"Texto"} children={formsOfReceipt.name} />
                <InfoTerm label={"Texto"} children={formsOfReceipt.operator} />
                {formsOfReceipt.fees.length > 0 && <h2 className="md:col-span-2 lg:col-span-3 font-bold text-xl my-4">{"Texto"}</h2>}
                {formsOfReceipt.fees.map((fee) => (
                     <div className="grid gap-4 md:grid-cols-2 md:col-span-2 lg:col-span-3" key={fee.id}>
                        <InfoTerm label={"Texto"} children={fee.minInstallments} />
                        <InfoTerm label={"Texto"} children={fee.maxInstallments} />
                        <InfoTerm label={"Texto"} children={`${fee.feePercentage.toFixed(2).replace(/\./g, ",")}%`} />
                        <InfoTerm label={"Texto"} children={`${fee.receiveInDays}`} />
                        <InfoTerm label={"Texto"} children={fee.customerInterest ? "Texto" : "Texto"} />
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