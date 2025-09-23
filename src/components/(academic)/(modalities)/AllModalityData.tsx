"use client";

import { fetcher } from "@/utils/fetcher";
import { Modality } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteModality from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import NewModalities from "./NewModalities";
import UpdateModalities from "./UpdateModalities";


interface MenuItemProps {
    categoryGroup: Modality;
    onUpdateClick: (b: Modality) => void;
    onDeleteClick: (b: Modality) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllModalityData() {
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedModality, setSelectedModality] = useState<Modality | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: modalities, error, isLoading, mutate } = useSWR<Modality[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/modalities`
            : null,
        fetcher
    );

    const handleUpdateClick = (modality: Modality) => {
        setSelectedModality(modality);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (modality: Modality) => {
        setSelectedModality(modality);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedModality(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedModality ? [selectedModality.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteModality(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedModality(null);
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
                <Menu.Label>{"Texto"}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {t("general.actions.deleteMany", {
                        items: selectedIds.length
                    })}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{"Texto"}</div>;
    if (error) return <p>{"Texto"}</p>;


    return (
        <>
            <DataView<Modality>
                disableTable
                data={modalities || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Texto"
                }}
                baseUrl="/system/financial/modalities/"
                mutate={mutate}
                pageTitle={"Texto"}
                searchbarPlaceholder={"Texto"}
                columns={[
                    { key: "name", label: "Texto" },
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

            <NewModalities opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate} />

            {selectedModality && (
                <UpdateModalities
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedModality(null);
                    }}
                    modality={selectedModality}
                    mutate={mutate}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={"Texto"}
                confirmLabel={"Texto"}
                cancelLabel={"Texto"}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("academic.modalities.modals.confirmModal.textArray",
                        { modalities: idsToDelete.length }
                    )
                ) : (
                    t("academic.modalities.modals.confirmModal.text", {
                        modality: selectedModality?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Texto"}</Text>
            </ConfirmationModal>
        </>
    );
}