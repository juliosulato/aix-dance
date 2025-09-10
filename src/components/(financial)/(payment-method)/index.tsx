"use client";
import DataView from "@/components/ui/DataView";
import { useEffect, useState } from "react";
import NewPaymentMethod from "./modals/newPaymentMethod";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { useSession } from "next-auth/react";
import { PaymentFee, PaymentMethod as PrismaPaymentMethod } from "@prisma/client";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import deletePaymentMethod from "./deletePaymentMethod";
import UpdatePaymentMethod from "./modals/updatePaymentMethod";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export interface PaymentMethod extends PrismaPaymentMethod {
    fees: PaymentFee[];
}

interface MenuItemProps {
    paymentMethod: PaymentMethod;
    onUpdateClick: (pm: PaymentMethod) => void;
    onDeleteClick: (pm: PaymentMethod) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}


export default function PaymentMethodsView() {
    const t = useTranslations("");
    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const locale = useLocale();
    dayjs.locale(locale);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: paymentMethods, error, isLoading, mutate } = useSWR<PaymentMethod[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/payment-methods`
            : null,
        fetcher
    );

    const handleUpdateClick = (pm: PaymentMethod) => {
        setSelectedPaymentMethod(pm);
        setOpenUpdate(true); // ADICIONADO: Abertura explícita do modal.
    };

    const handleDeleteClick = (pm: PaymentMethod) => {
        setSelectedPaymentMethod(pm);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedPaymentMethod(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedPaymentMethod ? [selectedPaymentMethod.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deletePaymentMethod(finalIdsToDelete, tenancyId);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedPaymentMethod(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ paymentMethod, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(paymentMethod)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(paymentMethod)}>
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
            <DataView<PaymentMethod>
                data={paymentMethods || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("financial.payment-methods.modals.create.title")
                }}
                baseUrl="/system/financial/payment-methods/"
                mutate={mutate}
                pageTitle={t("financial.payment-methods.title")}
                searchbarPlaceholder={t("financial.payment-methods.searchbarPlaceholder")}
                columns={[
                    { key: "name", label: t("financial.payment-methods.modals.fields.name.label") },
                    { key: "operator", label: t("financial.payment-methods.modals.fields.operator.label") },
                ]}
                RenderRowMenu={(item) => <MenuItem paymentMethod={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem paymentMethod={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="flex flex-col mt-4">
                            {item.operator && <Text size="sm" c="dimmed">{t("financial.payment-methods.modals.fields.operator.label")} {item.operator}</Text>}
                            <Text size="xs" c="dimmed" mt="sm">
                                {t("forms.general-fields.createdAt")} {dayjs(item.createdAt).format("DD/MM/YYYY")}
                            </Text>
                        </div>
                    </>
                )}
            />

            <NewPaymentMethod opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedPaymentMethod && (
                <UpdatePaymentMethod
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedPaymentMethod(null);
                    }}
                    paymentMethod={selectedPaymentMethod}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("financial.payment-method.modals.confirmModal.title")}
                confirmLabel={t("financial.payment-method.modals.confirmModal.confirmLabel")}
                cancelLabel={t("financial.payment-method.modals.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("financial.payment-method.modals.confirmModal.textArray",
                        { paymentMethods: idsToDelete.length }
                    )
                ) : (
                    t("financial.payment-method.modals.confirmModal.text", {
                        paymentMethods: selectedPaymentMethod?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("financial.payment-method.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}