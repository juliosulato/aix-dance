"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteCategoryGroups from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewCategoryBill from "./modals/NewCategory";
import UpdateCategoryBill from "./modals/UpdateCategory";
import { CategoryBill } from "@/types/bill.types";


interface MenuItemProps {
    categoryGroup: CategoryBill;
    onUpdateClick: (b: CategoryBill) => void;
    onDeleteClick: (b: CategoryBill) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllCategoryData() {
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryBill | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: categoryGroups, error, isLoading, mutate } = useSWR<CategoryBill[]>(
        () => sessionData?.user?.tenancyId
            ? `/api/v1/tenancies/${sessionData.user.tenancyId}/category-bills`
            : null,
        fetcher
    );

    const handleUpdateClick = (category: CategoryBill) => {
        setSelectedCategory(category);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (category: CategoryBill) => {
        setSelectedCategory(category);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedCategory(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedCategory ? [selectedCategory.id] : []);

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
            setSelectedCategory(null);
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
                    Deletar {selectedIds.length} selecionados
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;
    if (error) return <p>{"Erro inesperado"}</p>;


    return (
        <>
            <DataView<CategoryBill>
                disableTable
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Nova Categoria"
                }}
                baseUrl="/system/financial/categories/"
                mutate={mutate as any}
                pageTitle={"Categorias"}
                searchbarPlaceholder={"Procurar categorias..."}
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

            <NewCategoryBill opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedCategory && (
                <UpdateCategoryBill
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedCategory(null);
                    }}
                    category={selectedCategory}
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
                    `Tem certeza que deseja excluir ${idsToDelete.length} categoria$        {idsToDelete.length > 1 ? 's' : ''}?`
                ) : (
                    `Tem certeza que deseja excluir a categoria "${selectedCategory?.name || ''}"?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Essa ação é irreversível."}</Text>
            </ConfirmationModal>
        </>
    );
}