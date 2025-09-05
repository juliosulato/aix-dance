"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import deleteBanks from "../delete";
import { Bank } from "@prisma/client";
import UpdateBankAccount from "../modals/updateBankAccount";

export default function BanksView({ bank, tenancyId }: { bank: Bank, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteBanks([bank.id], tenancyId, t);
            window.location.replace("/system/financial/bank-accounts");
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
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("financial.banks.view.title")}</h1>
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
                <InfoTerm label={t("financial.banks.modals.fields.name.label")} value={bank.name} />
                <InfoTerm label={t("financial.banks.modals.fields.agency.label")} value={bank.agency} />
                <InfoTerm label={t("financial.banks.modals.fields.account.label")} value={bank.account} />
                <InfoTerm label={t("financial.banks.modals.fields.maintenanceFeeAmount.label")} value={Number(bank.maintenanceFeeAmount || 0)?.toFixed(2).replace(/\./g, ",")} />
                <InfoTerm label={t("financial.banks.modals.fields.maintenanceFeeDue.label")} value={Number(bank.maintenanceFeeDue)} />
                <InfoTerm label={t("financial.banks.modals.fields.description.label")} value={bank.description} className="md:col-span-2 lg:col-span-3 mt-5" />
            </div>

            <UpdateBankAccount bankAccount={bank} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload()} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                { t("financial.banks.modals.confirmModal.text", {
                        bank: bank?.name || ""
                    })}
            </ConfirmationModal>
        </div>
    );
}