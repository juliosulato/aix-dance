"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Plan, PlanType } from "@prisma/client";
import UpdatePlan from "../modals/UpdatePlan"; // Reutilizando seu modal de atualização
import deletePlans from "../delete"; // Reutilizando sua função de deleção (agora desativação)
import { useRouter } from "next/navigation";

const formatPlanType = (type: PlanType, t: (key: string) => string) => {
    switch (type) {
        case "MONTHLY": return "Texto";
        case "SEMMONTLY": return "Texto";
        case "BI_MONTHLY": return "Texto";
        case "QUARTERLY": return "Texto";
        case "BI_ANNUAL": return "Texto";
        case "ANNUAL": return "Texto";
        default: return type;
    }
}

export default function PlanView({ plan, tenancyId }: { plan: Plan, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
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

            {/* Seção de Informações Básicas */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{"Texto"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Texto"} children={plan.name} />
                <InfoTerm label={"Texto"} children={`R$ ${Number(plan.amount).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={"Texto"} children={`${plan.frequency}x`} />
                <InfoTerm label={"Texto"} children={formatPlanType(plan.type, t)} />
            </div>

            {/* Seção de Juros */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Texto"}</h2>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Texto"} children={`${Number(plan.monthlyInterest).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={"Texto"} children={`${plan.interestGracePeriod} dias`} />
            </div>

            {/* Seção de Multa */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Texto"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Texto"} children={`${Number(plan.finePercentage).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={"Texto"} children={`${plan.fineGracePeriod} dias`} />
            </div>

            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Texto"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Texto"} children={`${Number(plan.discountPercentage).toFixed(2).replace(/\./g, ",")}%`} />
                <InfoTerm label={"Texto"} children={`Até ${plan.maximumDiscountPeriod} dias antes do vencimento`} />
            </div>

            {/* Modais de Ação */}
            <UpdatePlan plan={plan} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={"Texto"}
                confirmLabel={"Texto"}
                cancelLabel={"Texto"}
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
