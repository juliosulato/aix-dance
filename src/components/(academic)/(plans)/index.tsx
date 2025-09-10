"use client";

import { fetcher } from "@/utils/fetcher";
import { Plan, PlanType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import deletePlans from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import NewPlan from "./modals/NewPlan";
import UpdatePlan from "./modals/UpdatePlan";

interface MenuItemProps {
    plans: Plan;
    onUpdateClick: (b: Plan) => void;
    onDeleteClick: (b: Plan) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllPlansData() {
    const t = useTranslations("");
    const locale = useLocale();
    dayjs.locale(locale);

    const { data: sessionData, status } = useSession();

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { data: categoryGroups, error, isLoading, mutate } = useSWR<Plan[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/plans`
            : null,
        fetcher
    );

    const handleUpdateClick = (plan: Plan) => {
        setSelectedPlan(plan);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (plan: Plan) => {
        setSelectedPlan(plan);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedPlan(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedPlan ? [selectedPlan.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deletePlans(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedPlan(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ plans, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(plans)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(plans)}>
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
    
    const renderCicle = (val: PlanType) => {
        switch (val) {
            case "MONTHLY":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.MONTHLY");
                break;
            case "SEMMONTLY":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.SEMMONTLY");
            break;
            case "BI_MONTHLY":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.BI_MONTHLY");
            break;
            case "QUARTERLY":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.QUARTERLY");
            break;
            case "BI_ANNUAL":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.BI_ANNUAL");
            break;
            case "ANNUAL":
                return t("academic.plans.modals.basicInformations.fields.cicle.planTypes.ANNUAL");
            break;
            default: 
                return "";
            break;
        }
    }

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{t("general.errors.invalidSession")}</div>;
    if (error) return <p>{t("general.errors.loadingData")}</p>;


    return (
        <>
            <DataView<Plan>
                data={categoryGroups || []}
                openNewModal={{
                    func: () => setOpenNew(true),
                    label: t("academic.plans.modals.create.title")
                }}
                baseUrl="/system/academic/plans/"
                mutate={mutate}
                pageTitle={t("academic.plans.title")}
                searchbarPlaceholder={t("academic.plans.searchbarPlaceholder")}
                columns={[
                    { key: "name", label: t("academic.plans.modals.basicInformations.fields.name.label"), sortable: true },
                    {
                        key: "amount", label: t("academic.plans.modals.basicInformations.fields.amount.label"),
                        render: (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : '-',
                        sortable: true
                    },
                    {
                        key: "frequency", label: t("academic.plans.modals.basicInformations.fields.frequency.label"),
                        sortable: true,
                        render: (value) => `${value} ${t("academic.plans.modals.basicInformations.fields.frequency.suffix")}`
                    },
                     {
                        key: "type", label: t("academic.plans.modals.basicInformations.fields.cicle.label"),
                        sortable: true,
                        render: (value) => renderCicle(value)
                    }
                ]}
                RenderRowMenu={(item) => <MenuItem plans={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <>
                        <div className="flex flex-row justify-between items-start">
                            <Text fw={500} size="lg">{item.name}</Text>
                            <MenuItem plans={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </div>
                        <div className="flex flex-row justify-between items-start">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.amount))}
                            <span><strong>{t("academic.plans.modals.basicInformations.fields.cicle.label")}:</strong> {renderCicle(item.type)}</span>
                        </div>
                    </>
                )}
            />

            <NewPlan opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedPlan && (
                <UpdatePlan
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedPlan(null);
                    }}
                    plan={selectedPlan}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("academic.plans.modals.confirmModal.title")}
                confirmLabel={t("academic.plans.modals.confirmModal.confirmLabel")}
                cancelLabel={t("academic.plans.modals.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("academic.plans.modals.confirmModal.textArray",
                        { plans: idsToDelete.length }
                    )
                ) : (
                    t("academic.plans.modals.confirmModal.text", {
                        plan: selectedPlan?.name || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("academic.plans.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}