"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
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
    const { data: sessionData, status } = useSession();

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
            <DataView<SupplierFromApi>
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Texto"
                }}
                baseUrl="/system/others/suppliers/"
                mutate={mutate}
                pageTitle={"Texto"}
                searchbarPlaceholder={"Texto"}
                columns={[
                    { key: "name", label: "Texto" },
                    { key: "corporateReason", label: "Texto" },
                    { key: "email", label: "E-mail" },
                    { key: "cellPhoneNumber", label: "Celular" },
                    { key: "phoneNumber", label: "Telefone" },
                    { key: "document", label: "Texto" }
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
                            {item.corporateReason && <span><strong>{"Texto"}:</strong> {item.corporateReason}</span>}
                            {item.email && <span><strong>{"E-mail"}:</strong> {item.email}</span>}
                            {item.phoneNumber && <span><strong>{"Telefone"}:</strong> {item.phoneNumber}</span>}
                            {item.document && <span><strong>{"Texto"}:</strong> {item.document}</span>}
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
                title={"Texto"}
                confirmLabel={"Texto"}
                cancelLabel={"Texto"}
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
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Texto"}</Text>
            </ConfirmationModal>
        </>
    );
}