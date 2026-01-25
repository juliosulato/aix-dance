"use client";

import { useState, useRef } from "react";
import { Divider, Text } from "@mantine/core";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ContractModel } from "@/types/contracts.types";
import deleteContractModels from "./delete";
import UpdateContractModelModal from "./update";

import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
export default function ContractModelView({ id }: { id: string }) {
        const session = useSession().data;
        const tenantId = session?.user.tenantId as string;

        const { data: contractModel, error } = useSWR<ContractModel>(
            `/api/v1/tenants/${tenantId}/contract-templates/${id}`,
            fetcher
        );


    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const contractContentRef = useRef<HTMLDivElement>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteContractModels([contractModel?.id ?? "-"], tenantId, () => {});
            window.location.replace("/system/others/contract-templates");
        } catch (error) {
            console.error("Falha ao excluir o modelo de contrato:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    if (error) {
        console.error("Falha ao carregar os dados do modelo de contrato:", error);
        return <div>Falha ao carregar os dados do modelo de contrato.</div>;
    }

    if (!contractModel) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{contractModel.title}</h1>
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

            <Divider label="Conteúdo do Contrato" labelPosition="center" />
            <div className="border rounded-lg bg-neutral-50! cursor-not-allowed border-neutral-200 overflow-hidden">
                <div
                    ref={contractContentRef}
                    className="prose max-w-none p-8 "
                    dangerouslySetInnerHTML={{ __html: contractModel.htmlContent }}
                />
            </div>


            {contractModel.variablePresets && Object.keys(contractModel.variablePresets).length > 0 && (
                <>
                    <Divider className="mt-4" label="Variáveis Configuradas" labelPosition="center" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(contractModel.variablePresets).map(([key, value]) => (
                            <div key={key} className="p-3 bg-neutral-50 cursor-not-allowed rounded-lg">
                                <Text size="sm" c="dimmed">{`{{${key}}}`}{value}</Text>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <UpdateContractModelModal
                contractModel={contractModel}
                onClose={() => setOpenUpdate(false)}
                opened={openUpdate}
                mutate={() => window.location.reload() as unknown}
            />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                <Text>Você tem certeza que deseja excluir o modelo &quot;{contractModel?.title || ""}&quot;?</Text>
                <Text c="red" size="sm" fw={500} mt="md">Esta ação é permanente e não poderá ser desfeita.</Text>
            </ConfirmationModal>
        </div>
    );
}

