"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import { Plan, PlanType } from "@prisma/client";
import UpdatePlan from "../modals/UpdatePlan"; // Reutilizando seu modal de atualização
import deletePlans from "../delete"; // Reutilizando sua função de deleção (agora desativação)
import { useRouter } from "next/navigation";

const formatPlanType = (type: PlanType, t: (key: string) => string) => {
    switch (type) {
        case "MONTHLY": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.MONTHLY");
        case "SEMMONTLY": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.SEMMONTLY");
        case "BI_MONTHLY": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.BI_MONTHLY");
        case "QUARTERLY": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.QUARTERLY");
        case "BI_ANNUAL": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.BI_ANNUAL");
        case "ANNUAL": return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.ANNUAL");
        default: return type;
    }
}

export default function PlanView({ plan, tenancyId }: { plan: Plan, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const t = useTranslations();
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Chamando a função para desativar o plano
            await deletePlans([plan.id], tenancyId, t as any);
            // Redireciona para a lista de planos após a desativação
            router.push("/system/academic/plans");
            router.refresh(); // Força a atualização dos dados na página de listagem
        } catch (error) {
            console.error("Falha ao desativar o plano:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("academic.plans.view.title")}</h1>
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

            {/* Seção de Informações Básicas */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{t("academic.plans.modals.basicInformations.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("academic.plans.modals.basicInformations.fields.name.label")} children={plan.name} />
                <InfoTerm label={t("academic.plans.modals.basicInformations.fields.amount.label")} children={`R$ ${Number(plan.amount).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={t("academic.plans.modals.basicInformations.fields.frequency.label")} children={`${plan.frequency}x`} />
                <InfoTerm label={t("academic.plans.modals.basicInformations.fields.cicle.label")} children={formatPlanType(plan.type, t)} />
            </div>

            {/* Seção de Juros */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("academic.plans.modals.fees.title")}</h2>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("academic.plans.modals.fees.fields.interestPerMonth.label")} children={`${Number(plan.monthlyInterest).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={t("academic.plans.modals.fees.fields.interestGracePeriod.label")} children={`${plan.interestGracePeriod} dias`} />
            </div>

            {/* Seção de Multa */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("academic.plans.modals.fine.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("academic.plans.modals.fine.fields.finePercentage.label")} children={`${Number(plan.finePercentage).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={t("academic.plans.modals.fine.fields.fineGracePeriod.label")} children={`${plan.fineGracePeriod} dias`} />
            </div>

            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("academic.plans.modals.discount.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("academic.plans.modals.discount.fields.discountPercentage.label")} children={`${Number(plan.discountPercentage).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={t("academic.plans.modals.discount.fields.maximumDiscountPeriod.label")} children={`Até ${plan.maximumDiscountPeriod} dias antes do vencimento`} />
            </div>

            {/* Modais de Ação */}
            <UpdatePlan plan={plan} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={t("academic.plans.modals.confirmModal.title")}
                confirmLabel={t("academic.plans.modals.confirmModal.confirmLabel")}
                cancelLabel={t("academic.plans.modals.confirmModal.cancelLabel")}
                confirmColor="red"
                loading={isDeleting}
            >
                {t("academic.plans.modals.confirmModal.text", {
                    plan: plan?.name || ""
                })}
            </ConfirmationModal>
        </div>
    );
}
