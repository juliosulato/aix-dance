"use client";

import { fetcher } from "@/utils/fetcher";
import { CategoryGroup } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import deleteCategoryGroups from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
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
    const t = useTranslations("");
    const { data: sessionData, status } = useSession();
    const locale = useLocale();
    dayjs.locale(locale);

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<CategoryGroup | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: categoryGroups, error, isLoading, mutate } = useSWR<CategoryGroup[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/category-groups`
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
            await deleteCategoryGroups(finalIdsToDelete, tenancyId, t, mutate as any);
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
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(categoryGroup)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(categoryGroup)}>
                        {t("general.actions.delete")}
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
                <Menu.Label>{t("general.actions.manyActions")}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {t("general.actions.deleteMany", {
                        items: selectedIds.length
                    })}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{t("general.errors.invalidSession")}</div>;
    if (error) return <p>{t("general.errors.loadingData")}</p>;


    return (
        <>
            <DataView<CategoryGroup>
                disableTable
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("financial.category-groups.modals.create.title")
                }}
                baseUrl="/system/financial/groups/"
                mutate={mutate}
                pageTitle={t("financial.category-groups.title")}
                searchbarPlaceholder={t("financial.category-groups.searchbarPlaceholder")}
                columns={[
                    { key: "name", label: t("financial.category-groups.modals.fields.name.label") },
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
                title={t("financial.category-groups.modals.confirmModal.title")}
                confirmLabel={t("financial.category-groups.modals.confirmModal.confirmLabel")}
                cancelLabel={t("financial.category-groups.modals.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("financial.category-groups.modals.confirmModal.textArray",
                        { groups: idsToDelete.length }
                    )
                ) : (
                    t("financial.category-groups.modals.confirmModal.text", {
                        group: selectedCategoryGroup?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("financial.category-groups.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}