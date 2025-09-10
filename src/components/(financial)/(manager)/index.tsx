"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import useSWR from "swr";
import deleteBills from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text, Flex, Badge, Box, Divider, Tabs, Button } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import NewBill from "./modals/NewBill";
import UpdateBill from "./modals/UpdateBill";
import { Bank, Bill, CategoryBill, PaymentMethod, Supplier } from "@prisma/client";
import { StatusTextToBadge } from "@/utils/statusTextToBadge";
import { FaCalendarAlt } from "react-icons/fa";
import PayBill from "./modals/PayBill";
import { IoAdd } from "react-icons/io5";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

export type BillFromApi = Omit<Bill, 'amount' | 'amountPaid' | 'dueDate' | 'paymentDate' | 'recurrenceEndDate' | 'createdAt' | 'updatedAt'> & {
    amount: number;
    amountPaid: number | null;
    dueDate: string;
    paymentDate: string | null;
    recurrenceEndDate: string | null;
    createdAt: string;
    updatedAt: string;
    bank: Bank | null;
    supplier: Supplier | null;
    category: CategoryBill | null;
    paymentMethod: PaymentMethod | null;
    children: BillFromApi[];
    type: 'PAYABLE' | 'RECEIVABLE';
    totalInstallments?: number;
};

interface MenuItemProps {
    bill: BillFromApi;
    onUpdateClick: (b: BillFromApi) => void;
    onDeleteClick: (b: BillFromApi) => void;
}

interface MenuItemsProps {
    selectedIds: string[];
    onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllBillsData() {
    const t = useTranslations("");
    const { data: sessionData, status } = useSession();
    const locale = useLocale();
    dayjs.locale(locale);

    const [openNew, setOpenNew] = useState<boolean>(false);
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [openPayBill, setOpenPayBill] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [selectedBill, setSelectedBill] = useState<BillFromApi | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<string | null>('payable');

    const { data: parentBills, error, isLoading, mutate } = useSWR<BillFromApi[]>(
        () => sessionData?.user?.tenancyId
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bills`
            : null,
        fetcher
    );

    const allBills = useMemo(() => {
        if (!parentBills) return [];
        return parentBills.flatMap(parent => {
            const totalInstallments = (parent.children?.length || 0) + 1;
            const enhancedParent = { ...parent, totalInstallments };
            const enhancedChildren = parent.children?.map(child => ({ ...child, totalInstallments })) || [];
            return [enhancedParent, ...enhancedChildren];
        });
    }, [parentBills]);

    const filteredBills = useMemo(() => {
        if (!allBills) return [];
        if (!activeTab) return allBills;
        return allBills.filter(bill => bill.type.toLowerCase() === activeTab);
    }, [allBills, activeTab]);


    const handleUpdateClick = (bill: BillFromApi) => {
        setSelectedBill(bill);
        setOpenUpdate(true);
    };

    const handleDeleteClick = (bill: BillFromApi) => {
        setSelectedBill(bill);
        setIdsToDelete([]);
        setConfirmModalOpen(true);
    };

    const handleBulkDeleteClick = (ids: string[]) => {
        setIdsToDelete(ids);
        setSelectedBill(null);
        setConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const tenancyId = sessionData?.user?.tenancyId;
        if (!tenancyId) return;

        const finalIdsToDelete = idsToDelete.length > 0 ? idsToDelete : (selectedBill ? [selectedBill.id] : []);

        if (finalIdsToDelete.length === 0) {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            return;
        }

        try {
            await deleteBills(finalIdsToDelete, tenancyId, t, mutate as any);
            mutate();
        } catch (error) {
            console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
        } finally {
            setIsDeleting(false);
            setConfirmModalOpen(false);
            setSelectedBill(null);
            setIdsToDelete([]);
        }
    };

    const MenuItem = ({ bill, onUpdateClick, onDeleteClick }: MenuItemProps) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Menu shadow="md" width={200} withinPortal>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" radius={"md"}>
                        <BiDotsVerticalRounded />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("general.actions.title")}</Menu.Label>
                    <Menu.Item leftSection={<GrUpdate size={14} />} onClick={() => onUpdateClick(bill)}>
                        {t("general.actions.edit")}
                    </Menu.Item>
                    <Menu.Item leftSection={<RiMoneyDollarCircleLine size={14} />} onClick={() => {
                        setOpenPayBill(true);
                        setSelectedBill(bill)
                    }}>
                        <span>{t("financial.bills.payBill")}</span>
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<BiTrash size={14} />} onClick={() => onDeleteClick(bill)}>
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
            <DataView<BillFromApi>
                data={filteredBills}
                baseUrl="/system/financial/manager/"
                mutate={mutate}
                pageTitle={`${t("financial.bills.title")}`}
                searchbarPlaceholder={t("financial.bills.searchbarPlaceholder")}
                dateFilterOptions={[
                    { key: 'dueDate', label: 'Data de Vencimento' },
                    { key: 'createdAt', label: 'Data de Criação' },
                ]}
                columns={[
                    {
                        key: "complement",
                        label: t("financial.bills.modals.fields.complement.label"),
                        render: (value) => value ? value : "",
                        sortable: true
                    },
                    {
                        key: "amount",
                        label: t("financial.bills.modals.fields.amount.label"),
                        render: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        sortable: true
                    },
                    {
                        key: "amountPaid",
                        label: t("financial.bills.modals.fields.amountPaid.label"),
                        render: (value) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : '-',
                        sortable: true
                    },
                    {
                        key: "installmentNumber",
                        label: t("financial.bills.modals.fields.installmentNumber.label"),
                        render: (value) => value ? <span className="text-primary">{value}</span> : <span className="text-primary">1</span>,
                        sortable: true
                    },
                    {
                        key: "description",
                        label: t("financial.bills.modals.fields.description.label"),
                    },
                    {
                        key: "dueDate",
                        label: t("financial.bills.modals.fields.dueDate.label"),
                        render: (value) => dayjs(value).format("DD/MM/YYYY"),
                        sortable: true
                    },
                    {
                        key: "bank",
                        label: t("financial.bills.modals.fields.bank.label"),
                        render: (bank) => bank?.name || '-',
                        sortable: true
                    },
                    {
                        key: "category",
                        label: t("financial.bills.modals.fields.category.label"),
                        render: (category) => category?.name || '-',
                        sortable: true
                    },
                    {
                        key: "paymentMethod",
                        label: t("financial.bills.modals.fields.payment-method.label"),
                        render: (paymentMethod) => paymentMethod?.name || '-',
                        sortable: true
                    },
                    {
                        key: "recurrence",
                        label: t("financial.bills.modals.fields.subscription.frequency.label"),
                        render: (rec) => rec
                    },
                    {
                        key: "status",
                        label: t("financial.bills.modals.fields.status.label"),
                        render: (st) => StatusTextToBadge(st, true, t)
                    },
                ]}
                renderHead={() => (
                    <>
                        <Tabs
                            variant="pills"
                            classNames={{ tab: "!px-6 !py-4 !font-medium !rounded-2xl", root: "!p-1 !bg-white !rounded-2xl shadow-sm" }}
                            value={activeTab}
                            onChange={setActiveTab}
                        >
                            <Tabs.List>
                                <Tabs.Tab value="payable">
                                    {t("financial.bills.payable")}
                                </Tabs.Tab>
                                <Tabs.Tab value="receivable">
                                    {t("financial.bills.receivable")}
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                        {activeTab == "payable" && (
                            <Button
                                type="button"
                                color="#7439FA"
                                radius="lg"
                                size="lg"
                                className="!text-sm !font-medium tracking-wider ml-auto min-w-full w-full md:min-w-fit md:w-fit"
                                rightSection={<IoAdd />}
                                onClick={() => setOpenNew(true)}
                            >
                                {t("financial.bills.modals.create.title")}
                            </Button>
                        )}
                    </>
                )}
                RenderRowMenu={(item) => <MenuItem bill={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />}
                RenderAllRowsMenu={(selectedIds) => <MenuItems selectedIds={selectedIds} onBulkDeleteClick={handleBulkDeleteClick} />}
                renderCard={(item) => (
                    <Box className="flex flex-col h-full">
                        <Flex justify="space-between" align="start">
                            {StatusTextToBadge(item.status, true, t)}
                            <MenuItem bill={item} onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
                        </Flex>

                        <Box className="flex-grow my-4">
                            <Text size="sm" c="dimmed">{item.category?.name || 'Sem categoria'}</Text>
                            <Text fw={500} lineClamp={2}>{item.description || "Sem descrição"}</Text>
                        </Box>

                        <Divider my="xs" />

                        <Flex justify="space-between" align="center">
                            <Text size="sm" c="dimmed">Vencimento</Text>
                            <Flex align="center" gap="xs">
                                <FaCalendarAlt className="text-gray-500" />
                                <Text size="sm" fw={500}>{dayjs(item.dueDate).format("DD/MM/YYYY")}</Text>
                            </Flex>
                        </Flex>

                        <Flex justify="space-between" align="center" mt="sm">
                            <Text size="lg" fw={700} c="gray.8">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                            </Text>
                            {(item.totalInstallments && item.totalInstallments > 1) && (
                                <Badge variant="light" color="gray">
                                    {item.installmentNumber}
                                </Badge>
                            )}
                        </Flex>
                    </Box>
                )}
            />

            <NewBill opened={openNew} onClose={() => setOpenNew(false)} mutate={mutate as any} />

            {selectedBill && (
                <UpdateBill
                    opened={openUpdate}
                    onClose={() => {
                        setOpenUpdate(false);
                        setSelectedBill(null);
                    }}
                    bill={selectedBill as any}
                    mutate={mutate as any}
                />
            )}

            {selectedBill && (
                <PayBill
                    opened={openPayBill}
                    onClose={() => {
                        setOpenPayBill(false);
                        setSelectedBill(null);
                    }}
                    bill={selectedBill as any}
                    mutate={mutate as any}
                />
            )}

            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t("financial.bills.modals.confirmModal.title")}
                confirmLabel={t("financial.bills.modals.confirmModal.confirmLabel")}
                cancelLabel={t("financial.bills.modals.confirmModal.cancelLabel")}
                loading={isDeleting}
            >
                {idsToDelete.length > 0 ? (
                    t("financial.bills.modals.confirmModal.textArray",
                        { bills: idsToDelete.length }
                    )
                ) : (
                    t("financial.bills.modals.confirmModal.text", {
                        bill: dayjs(selectedBill?.dueDate).format("DD MMMM YYYY") || ""
                    })
                )}
                <br />
                <Text component="span" c="red" size="sm" fw={500} mt="md">{t("financial.bills.modals.confirmModal.warn")}</Text>
            </ConfirmationModal>
        </>
    );
}
