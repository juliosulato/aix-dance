"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR from "swr";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

// dayjs imports removed (not used in this component)
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
            ? `/api/v1/tenancies/${sessionData.user.tenancyId}/suppliers`
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
            await deleteSuppliers(finalIdsToDelete, tenancyId, mutate as any);
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
            <DataView<SupplierFromApi>
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Novo Fornecedor"
                }}
                baseUrl="/system/others/suppliers/"
                mutate={mutate as any}
                pageTitle={"Fornecedores"}
                searchbarPlaceholder={"Pesquisar fornecedores..."}
                columns={[
                    { key: "name", label: "Nome" },
                    { key: "corporateReason", label: "Razão Social" },
                    { key: "email", label: "E-mail" },
                    { key: "cellPhoneNumber", label: "Celular" },
                    { key: "phoneNumber", label: "Telefone" },
                    { key: "document", label: "Documento" }
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
                            {item.corporateReason && <span><strong>{"Razão Social"}:</strong> {item.corporateReason}</span>}
                            {item.email && <span><strong>{"E-mail"}:</strong> {item.email}</span>}
                            {item.phoneNumber && <span><strong>{"Telefone"}:</strong> {item.phoneNumber}</span>}
                            {item.document && <span><strong>{"Documento"}:</strong> {item.document}</span>}
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
                title={"Confirmar Exclusão"}
                confirmLabel={"Excluir"}
                cancelLabel={"Cancelar"}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    `Tem certeza que deseja excluir os ${idsToDelete.length} fornecedores selecionados?`
                ) : (
                    `Tem certeza que deseja excluir o fornecedor ${selectedSupplier?.name || ""}?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">Nenhum fornecedor encontrado.</Text>
            </ConfirmationModal>
        </>
    );
}