"use client";

import { fetcher } from "@/utils/fetcher";
import { CategoryGroup } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteCategoryGroups from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

// dayjs imports removed (not used in this component)
import NewCategoryGroup from "./NewGroup";
import UpdateCategoryGroup from "./UpdateGroup";


interface MenuItemProps {
    categoryGroup: CategoryGroup;
    onUpdateClick: (b: CategoryGroup) => void;
    onDeleteClick: (b: CategoryGroup) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllCategoryGroupsData() {
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<CategoryGroup | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: categoryGroups, error, isLoading, mutate } = useSWR<CategoryGroup[]>(
        () => sessionData?.user?.tenancyId
            ? `/api/v1/tenancies/${sessionData.user.tenancyId}/category-groups`
            : null,
        fetcher
    );

    const handleUpdateClick = (group: CategoryGroup) => {
        setSelectedCategoryGroup(group);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (group: CategoryGroup) => {
        setSelectedCategoryGroup(group);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedCategoryGroup(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedCategoryGroup ? [selectedCategoryGroup.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteCategoryGroups(finalIdsToDelete, tenancyId, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedCategoryGroup(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ categoryGroup, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{"Ações"}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(categoryGroup)}>
                        {"Editar"}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(categoryGroup)}>
                        {"Excluir"}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );

    const MenuItems = ({ selectedIds, onBulkDeleteClick }: MenuItemsProps) => (
        <Menu shadow="md" width={200} withinPortal>
            <Menu.Target>
                <ActionIcon variant="light" color="gray" radius={"md"}>
                    <BiDotsVerticalRounded />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>{"Ações em Massa"}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {"Excluir selecionados"}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;
    if (error) return <p>{"Erro inesperado"}</p>;


    return (
        <>
            <DataView<CategoryGroup>
                disableTable
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Novo Grupo"
                }}
                baseUrl="/system/financial/groups/"
                mutate={mutate as any}
                pageTitle={"Grupos de Categorias"}
                searchbarPlaceholder={"Pesquisar grupos..."}
                columns={[
                    { key: "name", label: "Nome" },
                ]}
                RenderRowMenu={(item) => <MenuItem categoryGroup={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem categoryGroup={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                    </>
                )}
            />

            <NewCategoryGroup opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedCategoryGroup && (
                <UpdateCategoryGroup
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedCategoryGroup(null);
                    }}
                    categoryGroups={selectedCategoryGroup}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={"Confirmar Exclusão"}
                confirmLabel={"Excluir"}
                cancelLabel={"Cancelar"}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    `Tem certeza que deseja excluir os ${idsToDelete.length} grupos de categorias selecionados?`
                ) : (
                    `Tem certeza que deseja excluir o grupo de categorias ${selectedCategoryGroup?.name || ""}?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">Aviso: essa operação é irreversível.</Text>
            </ConfirmationModal>
        </>
    );
}