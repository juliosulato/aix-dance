"use client";

import { deleteBanks } from "@/actions/financial/banks/delete"; // Supondo que exista este arquivo
import { ActionIcon, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewBank from "./NewBankAccount";
import UpdateBank from "./UpdateBankAccount";
import { Bank } from "@/types/bank.types";
import { useCrud } from "@/hooks/useCrud"; 
import { SessionData } from "@/lib/auth-server";

interface MenuItemProps {
    bank: Bank;
    onUpdateClick: (b: Bank) => void;
    onDeleteClick: (b: Bank) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllBanksData({ banks, user }: { banks: Bank[], user: SessionData['user'] }) {

    const crud = useCrud<Bank>();

    const onConfirmDelete = () => {
        crud.confirmDelete(
            (ids, tId) => deleteBanks(ids), 
            user?.tenancyId,
        );
    };

    const MenuItem = ({ bank, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{"Ações"}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(bank)}>
                        {"Editar"}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(bank)}>
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

    return (
        <>
            <DataView<Bank>
                disableTable
                data={banks || []}
                openNewModal={{
                    func: crud.handleCreate,
                    label: "Novo Banco"
                }}
                baseUrl="/system/financial/banks/"
                pageTitle={"Bancos"}
                searchbarPlaceholder={"Procurar bancos..."}
                columns={[
                    { key: "name", label: "Nome" },
                ]}
                RenderRowMenu={(item) => <MenuItem bank={item} onUpdateClick={crud.handleUpdate} onDeleteClick={crud.handleDelete} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={crud.handleBulkDelete} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem bank={item} onUpdateClick={crud.handleUpdate} onDeleteClick={crud.handleDelete} />
                        </div>
                    </>
                )}
            />

            <NewBank 
                opened={crud.modals.create} 
                onClose={() => crud.setModals.setCreate(false)} 
            />

            {crud.selectedItem && (
                <UpdateBank
                    opened={crud.modals.update}
                    onClose={() => crud.setModals.setUpdate(false)}
                    bankAccount={crud.selectedItem}
                />
            )}

            <ConfirmationModal
                opened={crud.modals.delete}
                onClose={() => crud.setModals.setDelete(false)}
                onConfirm={onConfirmDelete}
                title={"Confirmar Exclusão"}
                confirmLabel={"Excluir"}
                cancelLabel={"Cancelar"}
                loading={crud.isDeleting}
            >
                {crud.idsToDelete.length > 0 ? (
                    `Tem certeza que deseja excluir ${crud.idsToDelete.length} banco${crud.idsToDelete.length > 1 ? 's' : ''}?`
                ) : (
                    `Tem certeza que deseja excluir o banco "${crud.selectedItem?.name || ''}"?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Essa ação é irreversível."}</Text>
            </ConfirmationModal>
        </>
    );
}