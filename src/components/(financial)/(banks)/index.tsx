"use client";

import { fetcher } from "@/utils/fetcher";
import { Bank } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
dayjs.locale("pt-br");

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
    const t = useTranslations("");
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: banks, error, isLoading, mutate } = useSWR<Bank[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/banks`
            : null,
        fetcher
    );

    const handleUpdateClick = (pm: Bank) => {
        setSelectedBank(pm);
        setOpenUpdate(true); // ADICIONADO: Abertura explícita do modal.
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
            await deleteBanks(finalIdsToDelete, tenancyId, t, mutate);
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
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(bankAccount)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(bankAccount)}>
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
            <DataView<Bank>
                data={banks || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("financial.banks.modals.create.title")
                }}
                baseUrl="/system/financial/bank-accounts/"
                mutate={mutate}
                pageTitle={t("financial.banks.title")}
                searchbarPlaceholder={t("financial.banks.searchbarPlaceholder")}
                columns={[
                    { key: "name", label: t("financial.banks.modals.fields.name.label") },
                    { key: "agency", label: t("financial.banks.modals.fields.agency.label") },
                    { key: "account", label: t("financial.banks.modals.fields.account.label") },
                    { key: "code", label: t("financial.banks.modals.fields.code.label") },
                    { key: "maintenanceFeeAmount", label: t("financial.banks.modals.fields.maintenanceFeeAmount.label") },
                    { key: "maintenanceFeeDue", label: t("financial.banks.modals.fields.maintenanceFeeDue.label") },
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
                                {t("forms.general-fields.createdAt")} {dayjs(item.createdAt).format("DD/MM/YYYY")}
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
                title={t("financial.banks.modals.confirmModal.title")}
                confirmLabel={t("financial.banks.modals.confirmModal.confirmLabel")}
                cancelLabel={t("financial.banks.modals.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("financial.banks.modals.confirmModal.textArray",
                        { banks: idsToDelete.length }
                    )
                ) : (
                    t("financial.banks.modals.confirmModal.text", {
                        bank: selectedBank?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("financial.banks.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}