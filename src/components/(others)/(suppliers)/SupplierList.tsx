"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import deleteSuppliers from "./delete";
import NewSupplier from "./newSupplier";
import UpdateSupplier from "./UpdateSupplier";
import { SupplierFromApi } from "./SupplierFromApi";


interface MenuItemProps {
    categoryGroup: SupplierFromApi;
    onUpdateClick: (b: SupplierFromApi) => void;
    onDeleteClick: (b: SupplierFromApi) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllSuppliersData() {
    const t = useTranslations("");
    const { data: sessionData, status } = useSession();
    const locale = useLocale();
    dayjs.locale(locale);

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierFromApi | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: categoryGroups, error, isLoading, mutate } = useSWR<SupplierFromApi[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/suppliers`
            : null,
        fetcher
    );

    const handleUpdateClick = (supplier: SupplierFromApi) => {
        setSelectedSupplier(supplier);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (supplier: SupplierFromApi) => {
        setSelectedSupplier(supplier);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedSupplier(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedSupplier ? [selectedSupplier.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteSuppliers(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir o(s) fornecedores:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedSupplier(null);
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
            <DataView<SupplierFromApi>
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("suppliers.create.title")
                }}
                baseUrl="/system/others/suppliers/"
                mutate={mutate}
                pageTitle={t("suppliers.title")}
                searchbarPlaceholder={t("suppliers.searchbarPlaceholder")}
                columns={[
                    { key: "name", label: t("suppliers.fields.name.label") },
                    { key: "corporateReason", label: t("suppliers.fields.corporateReason.label") },
                    { key: "email", label: t("forms.general-fields.email.label") },
                    { key: "cellPhoneNumber", label: t("forms.general-fields.cellPhoneNumber.label") },
                    { key: "phoneNumber", label: t("forms.general-fields.phoneNumber.label") },
                    { key: "document", label: t("suppliers.fields.document.label") }
                ]}
                RenderRowMenu={(item) => <MenuItem categoryGroup={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem categoryGroup={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="flex flex-col gap-1">
                            {item.corporateReason && <span><strong>{t("suppliers.fields.corporateReason.label")}:</strong> {item.corporateReason}</span>}
                            {item.email && <span><strong>{t("forms.general-fields.email.label")}:</strong> {item.email}</span>}
                            {item.phoneNumber && <span><strong>{t("forms.general-fields.phoneNumber.label")}:</strong> {item.phoneNumber}</span>}
                            {item.document && <span><strong>{t("suppliers.fields.document.label")}:</strong> {item.document}</span>}
                        </div>
                    </>
                )}
            />

            <NewSupplier opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate} />

            {selectedSupplier && (
                <UpdateSupplier
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedSupplier(null);
                    }}
                    supplier={selectedSupplier}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("suppliers.confirmModal.title")}
                confirmLabel={t("suppliers.confirmModal.confirmLabel")}
                cancelLabel={t("suppliers.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("suppliers.confirmModal.textArray",
                        { suppliers: idsToDelete.length }
                    )
                ) : (
                    t("suppliers.confirmModal.text", {
                        supplier: selectedSupplier?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("suppliers.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}