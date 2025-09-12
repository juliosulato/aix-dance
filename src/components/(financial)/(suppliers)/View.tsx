"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { Divider, SimpleGrid } from "@mantine/core";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import deleteSuppliers from "./delete";
import UpdateSupplier from "./UpdateSupplier";
import { SupplierFromApi } from "./SupplierFromApi";

export default function SupplierView({ supplier, tenancyId }: { supplier: SupplierFromApi, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const t = useTranslations();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteSuppliers([supplier.id], tenancyId, t);
            window.location.replace("/system/suppliers");
        } catch (error) {
            console.error("Falha ao excluir o fornecedor:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };


    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("suppliers.title")}</h1>
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
                <InfoTerm label={t("suppliers.fields.name.label")} children={supplier.name} />
                <InfoTerm label={t("suppliers.fields.corporateReason.label")} children={supplier.corporateReason} />
                <InfoTerm label={t("suppliers.fields.document.label")} children={supplier.document} />
                <InfoTerm label={t("suppliers.fields.documentType.label")} children={supplier.documentType} />
                <InfoTerm label={t("forms.general-fields.phoneNumber.label")} children={supplier.phoneNumber} />
                <InfoTerm label={t("forms.general-fields.cellPhoneNumber.label")} children={supplier.cellPhoneNumber} />
                <InfoTerm label={t("forms.general-fields.email.label")} children={supplier.email} />
                <Divider className="md:col-span-2 lg:col-span-3" label={t("forms.address.title")} labelPosition="center" />
                <InfoTerm label={t("forms.address.publicPlace.label")} children={`${supplier.address.publicPlace}`} />
                <InfoTerm label={t("forms.address.neighborhood.label")} children={supplier.address.neighborhood} />
                <InfoTerm label={t("forms.address.complement.label")} children={supplier.address.complement} />
                <InfoTerm label={t("forms.address.number.label")} children={supplier.address.number} />
                <InfoTerm label={t("forms.address.city.label")} children={supplier.address.city} />
                <InfoTerm label={t("forms.address.state.label")} children={supplier.address.state} />
                <InfoTerm label={t("forms.address.zipCode.label")} children={supplier.address.zipCode} />
            </div>

            <UpdateSupplier supplier={supplier} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                {t("suppliers.confirmModal.text", {
                    supplier: supplier?.name || ""
                })}
            </ConfirmationModal>
        </div>
    );
}