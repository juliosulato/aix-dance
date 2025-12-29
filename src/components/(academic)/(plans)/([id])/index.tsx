"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Plan, PlanType } from "@/types/plan.types";
import UpdatePlan from "../modals/UpdatePlan"; // Reutilizando seu modal de atualização
import deletePlans from "../delete"; // Reutilizando sua função de deleção (agora desativação)
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

const formatPlanType = (type: PlanType) => {
    switch (type) {
        case "MONTHLY": return "Mensal";
        case "SEMMONTLY": return "Quinzenal";
        case "BI_MONTHLY": return "Bimestral";
        case "QUARTERLY": return "Trimestral";
        case "BI_ANNUAL": return "Semestral";
        case "ANNUAL": return "Anual";
        default: return type;
    }
};

export default function PlanView({ id }: { id: string }) {
    const session = useSession();
    const tenancyId = session?.data?.user.tenancyId as string;

    const { data: plan, error } = useSWR<Plan>(
        `/api/v1/tenancies/${tenancyId}/plans/${id}`,
        fetcher
    );


    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Chamando a função para desativar o plano
            await deletePlans([plan?.id || "-"], tenancyId);
            // Redireciona para a lista de planos após a desativação
            router.push("/system/academic/plans");
            router.refresh(); // Força a atualização dos dados na página de listagem
        } catch (error) {
            console.error("Falha ao desativar o plano:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    if (error) {
        console.error("Falha ao carregar os dados do plano:", error);
    }

    if (!plan) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{"Visualizar Plano"}</h1>
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
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{"Informações Básicas"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Nome"}>{plan.name}</InfoTerm>
                <InfoTerm label={"Valor"}>{`R$ ${Number(plan.amount).toFixed(2).replace(/\./g, ",")}`}</InfoTerm>
                <InfoTerm label={"Frequência"}>{`${plan.frequency}x`}</InfoTerm>
                <InfoTerm label={"Tipo"}>{formatPlanType(plan.type)}</InfoTerm>
            </div>

            {/* Seção de Juros */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Juros"}</h2>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Mensal"}>{`${Number(plan.monthlyInterest).toFixed(2).replace(/\./g, ",")}%`}</InfoTerm>
                <InfoTerm label={"Carência"}>{`${plan.interestGracePeriod} dias`}</InfoTerm>
            </div>

            {/* Seção de Multa */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Multa"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Percentual"}>{`${Number(plan.finePercentage).toFixed(2).replace(/\./g, ",")}%`}</InfoTerm>
                <InfoTerm label={"Carência"}>{`${plan.fineGracePeriod} dias`}</InfoTerm>
            </div>

            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Desconto"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Percentual"}>{`${Number(plan.discountPercentage).toFixed(2).replace(/\./g, ",")}%`}</InfoTerm>
                <InfoTerm label={"Período Máximo"}>{`Até ${plan.maximumDiscountPeriod} dias antes do vencimento`}</InfoTerm>
            </div>

            {/* Modais de Ação */}
            <UpdatePlan plan={plan} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={"Confirmar Exclusão"}
                confirmLabel={"Excluir"}
                cancelLabel={"Cancelar"}
                confirmColor="red"
                loading={isDeleting}
            >                Tem certeza que deseja desativar este plano?
            </ConfirmationModal>
        </div>
    );
}
