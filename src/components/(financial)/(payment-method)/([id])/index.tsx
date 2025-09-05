"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { PaymentMethod } from "..";
import { FaEdit, FaTrash } from "react-icons/fa";
import deletePaymentMethod from "../deletePaymentMethod";
import UpdatePaymentMethod from "../modals/updatePaymentMethod";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function PaymentMethodView({ paymentMethod, tenancyId }: { paymentMethod: PaymentMethod, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePaymentMethod([paymentMethod.id], tenancyId);
            window.location.replace("/system/financial/payment-methods");
        } catch (error) {
            console.error("Falha ao excluir a forma de pagamento:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col md:justify-between md:items-center md:flex-row md:flex-wrap">
                <h1 className="text-2xl font-bold">Dados da Forma de Pagamento</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>Excluir</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>Editar</span>
                    </button>
                </div>
            </div>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                <InfoTerm label={"Nome"} value={paymentMethod.name} />
                <InfoTerm label={"Operador"} value={paymentMethod.operator} />
                {paymentMethod.fees.map((fee) => (
                    <SimpleGrid cols={{ base: 1, md: 3 }} key={fee.id} spacing="xl" className="w-full md:col-span-3 lg:col-span-4">
                        <InfoTerm label="Mínimo de Parcelas" value={fee.minInstallments} />
                        <InfoTerm label="Máximo de Parcelas" value={fee.maxInstallments} />
                        <InfoTerm label="Juros" value={`${fee.feePercentage.toFixed(2).replace(/\./g, ",")}%`} />
                        <InfoTerm label="Dias para Recebimento" value={`${fee.receiveInDays} dias`} />
                        <InfoTerm label="Juros Repassado ao Cliente" value={fee.customerInterest ? "Sim" : "Não"} />
                    </SimpleGrid>
                ))}
            </SimpleGrid>

            <UpdatePaymentMethod paymentMethod={paymentMethod} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload()} />
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
                <strong className="mx-1">{paymentMethod.name}</strong>?
                Esta ação não poderá ser desfeita.
            </ConfirmationModal>
        </div>
    );
}