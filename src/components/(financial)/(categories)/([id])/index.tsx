"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import deleteCategories from "../delete";
import { CategoryBill } from "@prisma/client";
import UpdateCategoryBill from "../modals/UpdateCategory";

export default function CategoryBillView({ category, tenancyId }: { category: CategoryBill, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const t = useTranslations();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCategories([category.id], tenancyId, t);
            window.location.replace("/system/financial/categories");
        } catch (error) {
            console.error("Falha ao excluir o grupo:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };


    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("financial.category-groups.title")}</h1>
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
                <InfoTerm label={t("financial.category-groups.modals.fields.name.label")} value={category.name} />

                <UpdateCategoryBill category={category} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
                <ConfirmationModal
                    opened={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Exclusão"
                    confirmLabel="Sim, Excluir"
                    confirmColor="red"
                    loading={isDeleting}
                >
                    {t("financial.category-groups.modals.confirmModal.text", {
                        group: category?.name || ""
                    })}
                </ConfirmationModal>
            </div>
        </div>
    );
}