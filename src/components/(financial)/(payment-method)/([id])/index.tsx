"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { PaymentMethod } from "..";
import { FaEdit, FaTrash } from "react-icons/fa";
import deletePaymentMethod from "../deletePaymentMethod";
import UpdatePaymentMethod from "../modals/updatePaymentMethod";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";

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

    const t = useTranslations();

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("financial.payment-methods.view.title")}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{t("general.actions.delete")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{t("general.actions.update")}</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("financial.payment-methods.modals.fields.name.label")} children={paymentMethod.name} />
                <InfoTerm label={t("financial.payment-methods.modals.fields.operator.label")} children={paymentMethod.operator} />
                {paymentMethod.fees.length > 0 && <h2 className="md:col-span-2 lg:col-span-3 font-bold text-xl my-4">{t("financial.payment-methods.modals.feesSubtitle")}</h2>}
                {paymentMethod.fees.map((fee) => (
                     <div className="grid gap-4 md:grid-cols-2 md:col-span-2 lg:col-span-3" key={fee.id}>
                        <InfoTerm label={t("financial.payment-methods.modals.fields.fees.minInstallments")} children={fee.minInstallments} />
                        <InfoTerm label={t("financial.payment-methods.modals.fields.fees.maxInstallments")} children={fee.maxInstallments} />
                        <InfoTerm label={t("financial.payment-methods.modals.fields.fees.feePercentage")} children={`${fee.feePercentage.toFixed(2).replace(/\./g, ",")}%`} />
                        <InfoTerm label={t("financial.payment-methods.modals.fields.fees.receiveInDays")} children={`${fee.receiveInDays}`} />
                        <InfoTerm label={t("financial.payment-methods.modals.fields.fees.customerInterest")} children={fee.customerInterest ? t("general.boolean.yes") : t("general.boolean.no")} />
                    </div>
                ))}
            </div>

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