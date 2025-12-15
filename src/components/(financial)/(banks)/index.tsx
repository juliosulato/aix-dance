"use client";

import { fetcher } from "@/utils/fetcher";
import { Bank } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteBanks from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import UpdateBankAccount from "./modals/updateBankAccount";
import NewBankAccount from "./modals/newBankAccount";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

interface MenuItemProps {
    bankAccount: Bank;
    onUpdateClick: (b: Bank) => void;
    onDeleteClick: (b: Bank) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllBanksData() {
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: banks, error, isLoading, mutate } = useSWR<Bank[]>(
        () => sessionData?.user?.tenancyId
            ? `/api/v1/tenancies/${sessionData.user.tenancyId}/banks`
            : null,
        fetcher
    );

    const handleUpdateClick = (pm: Bank) => {
        setSelectedBank(pm);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (pm: Bank) => {
        setSelectedBank(pm);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedBank(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedBank ? [selectedBank.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteBanks(finalIdsToDelete, tenancyId, mutate);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedBank(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ bankAccount, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{"Ações"}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(bankAccount)}>
                        {"Editar"}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(bankAccount)}>
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
                <Menu.Label>{"Ações"}</Menu.Label>
                <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onBulkDeleteClick(selectedIds)}>
                    {`Excluir ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}`}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;
    if (error) return <p>{"Erro inesperado"}</p>;


    return (
        <>
            <DataView<Bank>
                data={banks || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: "Nova Conta"
                }}
                baseUrl="/system/financial/bank-accounts/"
                mutate={mutate as any}
                pageTitle={"Contas Bancárias"}
                searchbarPlaceholder={"Pesquisar contas..."}
                columns={[
                    { key: "name", label: "Nome" },
                    { key: "agency", label: "Agência" },
                    { key: "account", label: "Conta" },
                    { key: "code", label: "Código" },
                    { key: "maintenanceFeeAmount", label: "Taxa (R$)" },
                    { key: "maintenanceFeeDue", label: "Venc." },
                ]}
                RenderRowMenu={(item) => <MenuItem bankAccount={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem bankAccount={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="flex flex-col mt-4">
                            <Text size="xs" c="dimmed" mt="sm">
                                {"Criado em"} {dayjs(item.createdAt).format("DD/MM/YYYY")}
                            </Text>
                        </div>
                    </>
                )}
            />

            <NewBankAccount opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedBank && (
                <UpdateBankAccount
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedBank(null);
                    }}
                    bankAccount={selectedBank}
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
                    `Tem certeza de que deseja excluir ${idsToDelete.length} banco${idsToDelete.length > 1 ? 's' : ''}?`
                ) : (
                    `Tem certeza de que deseja excluir o banco ${selectedBank?.name || ""}?`
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{"Esta ação não pode ser desfeita."}</Text>
            </ConfirmationModal>
        </>
    );
}