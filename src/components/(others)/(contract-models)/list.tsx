"use client";

import { fetcher } from "@/utils/fetcher";
import { ContractModel } from "@/types/contracts.types";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR, { MutatorCallback } from "swr";
import deleteContractModels from "./delete"; // Nova função para excluir
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";
import dayjs from "dayjs";
import NewContractModelModal from "./new";
import UpdateContractModelModal from "./update";

// Props do Menu de Ações para um item
interface MenuItemProps {
    contractModel: ContractModel;
    onUpdateClick: (model: ContractModel) => void;
    onDeleteClick: (model: ContractModel) => void;
}

// Props do Menu de Ações para múltiplos itens
interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllContractModelsPage() {
    const { data: sessionData, isPending } = useSession();

    // Estados do componente
    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<ContractModel | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Busca de dados com SWR
    const { data: contractModels, error, isLoading, mutate } = useSWR<ContractModel[]>(
        () => sessionData?.user?.tenantId
            ? `/api/v1/tenants/${sessionData.user.tenantId}/contract-models`
            : null,
        fetcher
    );

    // Funções de manipulação de eventos
    const handleUpdateClick = (model: ContractModel) => {
        setSelectedModel(model);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (model: ContractModel) => {
        setSelectedModel(model);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedModel(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenantId = sessionData?.user?.tenantId;
        if (!tenantId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedModel ? [selectedModel.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteContractModels(finalIdsToDelete, tenantId, mutate as MutatorCallback);
            mutate(); // Revalida os dados para atualizar a UI
        } catch (error) {
            console.error("Falha ao excluir o(s) modelo(s):", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedModel(null);
            setIdsToDelete([]);
        }
    };

    // Componente de Menu para cada linha
    const MenuItem = ({ contractModel, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Ações</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(contractModel)}>
                        Editar
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(contractModel)}>
                        Excluir
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
    
    // Componente de Menu para ações em massa
    const MenuItems = ({ selectedIds, onBulkDeleteClick }: MenuItemsProps) => (
        <Menu shadow="md" width={200} withinPortal>
            <Menu.Target>
                <ActionIcon variant="light" color="gray" radius={"md"}>
                    <BiDotsVerticalRounded />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Ações em massa</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    Excluir {selectedIds.length} itens
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (isPending || isLoading) return <LoadingOverlay visible />;
    if (error) return <p>Erro ao carregar os dados.</p>;

    return sessionData && (
        <>
            <DataView<ContractModel>
                data={contractModels|| []} // Filtra os arquivados se o campo ainda existir no retorno da API
                baseUrl="/system/others/contract-models"
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Novo Modelo de Contrato"
                }}
                mutate={mutate as any}
                pageTitle="Modelos de Contrato"
                searchPlaceholder="Buscar por título do modelo..."
                columns={[
                    { key: "title", label: "Título", sortable: true },
                    {
                        key: "updatedAt", label: "Última Atualização",
                        render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
                        sortable: true
                    },
                ]}
                RenderRowMenu={(item) => <MenuItem contractModel={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.title}</Text>
                            <MenuItem contractModel={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="flex flex-row justify-between items-start mt-2">
                            <Text size="sm" c="dimmed">
                                Atualizado em: {dayjs(item.updatedAt).format('DD/MM/YYYY')}
                            </Text>
                        </div>
                    </>
                )}
            />

            <NewContractModelModal opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedModel && (
                <UpdateContractModelModal
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedModel(null);
                    }}
                    contractModel={selectedModel}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                confirmLabel="Sim, excluir"
                cancelLabel="Cancelar"
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    `Você tem certeza que deseja excluir ${idsToDelete.length} modelo(s) de contrato?`
                ) : (
                    `Você tem certeza que deseja excluir o modelo "${selectedModel?.title || ""}"?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">
                    Esta ação é permanente e não poderá ser desfeita.
                </Text>
            </ConfirmationModal>
        </>
    );
}

