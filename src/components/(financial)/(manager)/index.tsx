"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import deleteBills from "./delete";
import {
  ActionIcon,
  LoadingOverlay,
  Menu,
  Text,
  Flex,
  Badge,
  Box,
  Divider,
  Tabs,
  Button,
} from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import NewBill from "./modals/NewBill";
import UpdateBill from "./modals/UpdateBill";
import { StatusTextToBadge } from "@/utils/statusTextToBadge";
import { FaCalendarAlt } from "react-icons/fa";
import PayBill from "./modals/PayBill";
import { IoAdd } from "react-icons/io5";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { Bill,  RecurrenceType } from "@/types/bill.types";
import { CategoryBill,  } from "@/types/bill.types";
import { Supplier } from "@/types/supplier.types";
import Decimal from "decimal.js";
import { FormsOfReceipt } from "@/types/receipt.types";
import { Bank } from "@/types/bank.types";
import { Sale } from "@/types/sale.types";

export type BillFromApi = Bill & {
    bank?: Bank | null;
    category?: CategoryBill | null;
    formsOfReceipt?: FormsOfReceipt | null;
    sale?: Sale | null;
    supplier?: Supplier | null;
    totalInstallments?: number;
}

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
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [openPayBill, setOpenPayBill] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<BillFromApi | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string | null>("payable");

  type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  type PaginatedResponseLocal<T> = {
    products: T[];
    pagination: PaginationInfo;
  };

  const {
    data: parentBillsData,
    error,
    isLoading,
    mutate,
  } = useSWR<BillFromApi[] | PaginatedResponseLocal<BillFromApi>>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/bills`
        : null,
    fetcher
  );

  const parentBills: BillFromApi[] | undefined = Array.isArray(parentBillsData)
    ? parentBillsData
    : (parentBillsData as any)?.products ??
      (parentBillsData as any)?.bills ??
      undefined;

  const allBills = useMemo(() => {
    if (!parentBills) return [];
    const flat = parentBills.flatMap((parent: BillFromApi) => {
      const billParent = parent;
      const totalInstallments = (billParent?.children?.length || 0) + 1;
      const enhancedParent = { ...billParent, totalInstallments };
      const enhancedChildren =
        billParent?.children?.map((child: BillFromApi) => ({
          ...child,
          totalInstallments,
        })) || [];
      return [enhancedParent, ...enhancedChildren];
    });

    // Sort by requested business order: OVERDUE, AWAITING_RECEIPT, PENDING, PAID, CANCELLED
    const statusOrder: Record<string, number> = {
      OVERDUE: 0,
      AWAITING_RECEIPT: 1,
      PENDING: 2,
      PAID: 3,
      CANCELLED: 4,
    };

    return flat.sort((a, b) => {
      const aOrder = statusOrder[String(a.status)] ?? 99;
      const bOrder = statusOrder[String(b.status)] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Same status: sort by dueDate ascending
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [parentBills]);

  const filteredBills = useMemo(() => {
    if (!allBills) return [];
    if (!activeTab) return allBills;
    // Defensive: normalize both sides (trim + lowercase) because backend
    // values may contain different casing or accidental spaces.
    return allBills.filter((bill) => {
      const billType = bill?.type ? String(bill.type).trim().toLowerCase() : "";
      const target = String(activeTab).trim().toLowerCase();
      return billType === target;
    });
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

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedBill
        ? [selectedBill.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await deleteBills(finalIdsToDelete, tenancyId, mutate as any);
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
          <Menu.Label>{"Ações"}</Menu.Label>
          <Menu.Item
            leftSection={<GrUpdate size={14} />}
            onClick={() => onUpdateClick(bill)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            leftSection={<RiMoneyDollarCircleLine size={14} />}
            onClick={() => {
              setOpenPayBill(true);
              setSelectedBill(bill);
            }}
          >
            <span>{"Pagar"}</span>
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(bill)}
          >
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
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onBulkDeleteClick(selectedIds)}
        >
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
      <DataView<BillFromApi>
        data={filteredBills}
        baseUrl="/system/financial/manager/"
        mutate={mutate}
        pageTitle={`${"Contas"}`}
        searchbarPlaceholder={"Pesquisar contas..."}
        dateFilterOptions={[
          { key: "dueDate", label: "Data de Vencimento" },
          { key: "createdAt", label: "Data de Criação" },
        ]}
        columns={[
          {
            key: "complement",
            label: "Complemento",
            render: (value) => (value ? value : ""),
            sortable: true,
          },
          {
            key: "amount",
            label: "Valor",
            render: (value) =>
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value),
            sortable: true,
          },
          {
            key: "amountPaid",
            label: "Pago",
            render: (value) =>
              value
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                : "-",
            sortable: true,
          },
          {
            key: "installmentNumber",
            label: "Parcela",
            render: (value) =>
              value ? (
                <span className="text-primary">{value}</span>
              ) : (
                <span className="text-primary">1</span>
              ),
            sortable: true,
          },
          {
            key: "description",
            label: "Descrição",
          },
          {
            key: "dueDate",
            label: "Vencimento",
            render: (value) => dayjs(value).format("DD/MM/YYYY"),
            sortable: true,
          },
          {
            key: "bank",
            label: "Banco",
            render: (bank) => bank?.name || "-",
            sortable: true,
          },
          {
            key: "category",
            label: "Categoria",
            render: (category) => category?.name || "-",
            sortable: true,
          },
          {
            key: "formsOfReceipt",
            label: "Forma de Recebimento",
            render: (formsOfReceipt) => formsOfReceipt?.name || "-",
            sortable: true,
          },
          {
            key: "recurrence",
            label: "Recorrência",
            render: (rec: RecurrenceType) => {
              switch (rec) {
                case "MONTHLY":
                  return "Mensal";
                  break;
                case "ANNUAL":
                  return "Anual";
                  break;
                case "BIMONTHLY":
                  return "Bimestral";
                  break;
                case "QUARTERLY":
                  return "Trimestral";
                  break;
                case "SEMIANNUAL":
                  return "Semestral";
                  break;
                case "NONE":
                  return "";
                  break;
                default:
                  return "";
                  break;
              }
            },
          },
          {
            key: "status",
            label: "Status",
            render: (st) => StatusTextToBadge(st, true),
          },
        ]}
        renderHead={() => (
          <>
            <Tabs
              variant="pills"
              classNames={{
                tab: "!px-6 !py-4 !font-medium !rounded-2xl",
                root: "!p-1 !bg-white !rounded-2xl shadow-sm",
              }}
              value={activeTab}
              onChange={setActiveTab}
            >
              <Tabs.List>
                <Tabs.Tab value="payable">{"A Pagar"}</Tabs.Tab>
                <Tabs.Tab value="receivable">{"A Receber"}</Tabs.Tab>
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
                {"Nova Conta"}
              </Button>
            )}
          </>
        )}
        RenderRowMenu={(item) => (
          <MenuItem
            bill={item}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkDeleteClick={handleBulkDeleteClick}
          />
        )}
        renderCard={(item: BillFromApi) => (
          <Box className="flex flex-col h-full">
            <Flex justify="space-between" align="start">
              {StatusTextToBadge(item.status, true)}
              <MenuItem
                bill={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </Flex>

            <Box className="flex-grow my-4">
              <Text size="sm" c="dimmed">
                {item.category?.name || "Sem categoria"}
              </Text>
              <Text fw={500} lineClamp={2}>
                {item.description || "Sem descrição"}
              </Text>
            </Box>

            <Divider my="xs" />

            <Flex justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Vencimento
              </Text>
              <Flex align="center" gap="xs">
                <FaCalendarAlt className="text-gray-500" />
                <Text size="sm" fw={500}>
                  {dayjs(item.dueDate).format("DD/MM/YYYY")}
                </Text>
              </Flex>
            </Flex>

            <Flex justify="space-between" align="center" mt="sm">
              <Text size="lg" fw={700} c="gray.8">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.amount instanceof Decimal ? item.amount.toNumber() : item.amount ?? 0)}
              </Text>
              {item.totalInstallments && item.totalInstallments > 1 && (
                <Badge variant="light" color="gray">
                  {item.installmentNumber}
                </Badge>
              )}
            </Flex>
          </Box>
        )}
      />

      <NewBill
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

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
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? "Tem certeza que deseja excluir as contas selecionadas?"
          : `Tem certeza que deseja excluir a conta com vencimento em ${
              dayjs(selectedBill?.dueDate).format("DD/MM/YYYY") || ""
            }?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Aviso: ação irreversível.
        </Text>
      </ConfirmationModal>
    </>
  );
}
