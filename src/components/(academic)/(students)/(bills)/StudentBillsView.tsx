/* eslint-disable @typescript-eslint/no-unused-vars */
import dayjs from "dayjs";
import { FaCalendarAlt } from "react-icons/fa";
import DataView from "@/components/ui/DataView";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Flex,
  Menu,
  Text,
} from "@mantine/core";
import { StatusTextToBadge } from "@/utils/statusTextToBadge";
import "dayjs/locale/pt-br";
import { useState } from "react";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { notifications } from "@mantine/notifications";
import { StudentComplete } from "@/types/student.types";
import Decimal from "decimal.js";
import { deleteBills } from "@/actions/financial/bills.actions";


interface MenuItemProps {
  bill: StudentComplete["bills"][0];
  onDeleteClick: (b: StudentComplete["bills"][0]) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function StudentBillsView({
  student,
}: {
  student: StudentComplete;
}) {
  const bills = [...student.bills].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      OVERDUE: 0,
      AWAITING_RECEIPT: 1,
      PENDING: 2,
      PAID: 3,
      CANCELLED: 4,
    };
    const aOrder = statusOrder[String(a.status)] ?? 99;
    const bOrder = statusOrder[String(b.status)] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return dayjs(a.dueDate).diff(dayjs(b.dueDate));
  });

  const [, setOpenPayBill] = useState<boolean>(false);
  const [, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<
    StudentComplete["bills"][0] | null
  >(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [, setIsDeleting] = useState<boolean>(false);
  const [, setIsExempting] = useState<boolean>(false);

  const handleDeleteClick = (bill: StudentComplete["bills"][0]) => {
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
    const tenancyId = student.tenancyId;
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
      await deleteBills(finalIdsToDelete);
      window.location.reload();
    } catch (error) {
      console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedBill(null);
      setIdsToDelete([]);
    }
  };

  const exemptPenalty = async (ids: string[]) => {
    setIsExempting(true);
    const tenancyId = student.tenancyId;
    if (!tenancyId) {
      setIsExempting(false);
      alert("Tenancy ID ausente.");
      return;
    }

    try {
      const apiUrl = `/api/v1/tenancies/${tenancyId}/bills/exempt-penalty`;
      const res = await fetch(apiUrl, {
        method: "POST",
                credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao isentar multa");
      }

      const data = await res.json();
      // mostra um resumo do que foi atualizado antes de recarregar
      const msg = `Isenção concluída. Faturas atualizadas: ${
        data.updatedCount || 0
      }.`;

      notifications.show({
        title: "Isenção de Multa",
        message: msg,
        color: "green",
        autoClose: 8000,
      });
    } catch (error: unknown) {
      console.error("Falha ao isentar multa:", error);
      alert(
        "Falha ao isentar multa: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsExempting(false);
    }
  };

  // Funções de isenção agora chamam o endpoint e exibem o relatório retornado
  const handleExemptClick = async (bill: StudentComplete["bills"][0]) => {
    const hasPenalty = Boolean(bill.penaltyAmount instanceof Decimal ? bill.penaltyAmount.toNumber() > 0 : (bill?.penaltyAmount || 0) > 0);
    if (!hasPenalty) {
      const proceed = window.confirm(
        "Nenhuma multa aparente nesta cobrança. Deseja prosseguir mesmo assim?"
      );
      if (!proceed) return;
    } else {
      const ok = window.confirm("Confirma isentar a multa desta cobrança?");
      if (!ok) return;
    }

    await exemptPenalty([bill.id]);
  };

  const handleBulkExemptClick = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const selectedBills = student.bills.filter((b) => ids.includes(b.id));
    const anyWithPenalty = selectedBills.some((b) =>
      Boolean(b.penaltyAmount instanceof Decimal ? b.penaltyAmount.toNumber() > 0 : (b?.penaltyAmount || 0) > 0)
    );
    if (!anyWithPenalty) {
      const proceed = window.confirm(
        "Nenhuma das cobranças selecionadas possui multa aparente. Deseja prosseguir mesmo assim?"
      );
      if (!proceed) return;
    } else {
      const ok = window.confirm(
        `Confirma isentar a multa de ${ids.length} cobrança(ões)?`
      );
      if (!ok) return;
    }

    await exemptPenalty(ids);
  };

  const MenuItem = ({ bill, onDeleteClick }: MenuItemProps) => (
    <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <ActionIcon variant="light" color="gray" radius={"md"}>
            <BiDotsVerticalRounded />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
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
            leftSection={<RiMoneyDollarCircleLine size={14} />}
            onClick={async () => await handleExemptClick(bill)}
          >
            <span>{"Isentar Multa"}</span>
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
        <Menu.Label>{"Ações"}</Menu.Label>
        <Menu.Item
          leftSection={<RiMoneyDollarCircleLine size={14} />}
          onClick={() => handleBulkExemptClick(selectedIds)}
        >
          {`Isentar multa de ${selectedIds.length} item${
            selectedIds.length > 1 ? "s" : ""
          }`}
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onBulkDeleteClick(selectedIds)}
        >
          {`Excluir ${selectedIds.length} item${
            selectedIds.length > 1 ? "s" : ""
          }`}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <div className="bg-neutral-100 p-4 md:p-6 lg:p-8 rounded-2xl border-neutral-200 border mt-4 md:mt-6">
        <DataView<(typeof bills)[0]>
          data={bills}
          baseUrl="/system/financial/manager/"
          pageTitle={`${"Gerenciador Financeiro"}`}
          searchbarPlaceholder={"Buscar fatura por descrição, valor, status..."}
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
              key: "originalAmount",
              label: "Valor Original",
              render: (value, row) =>
                row.originalAmount
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(row.originalAmount))
                  : "-",
              sortable: false,
            },
            {
              key: "penaltyAmount",
              label: "Multa",
              render: (value, row) =>
                row.penaltyAmount
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(row.penaltyAmount))
                  : "-",
              sortable: false,
            },
            {
              key: "originalAmount",
              label: "Valor Original",
              render: (value, row) =>
                row.originalAmount
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(row.originalAmount instanceof Decimal ? row.originalAmount.toNumber() : row.originalAmount)
                  : "-",
              sortable: false,
            },
            {
              key: "penaltyAmount",
              label: "Multa",
              render: (value, row) =>
                row.penaltyAmount
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(row.penaltyAmount instanceof Decimal ? row.penaltyAmount.toNumber() : row.penaltyAmount)
                  : "-",
              sortable: false,
            },
            {
              key: "amountPaid",
              label: "Valor Pago",
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
              key: "status",
              label: "Status",
              render: (st) =>
                StatusTextToBadge(
                  st,
                  true,
                  st === "PENDING"
                    ? "Pendente"
                    : st === "PAID"
                    ? "Pago"
                    : st === "OVERDUE"
                    ? "Atrasado"
                    : st === "CANCELLED"
                    ? "Cancelado"
                    : st
                ),
            },
          ]}
          RenderRowMenu={(item) => (
            <MenuItem bill={item} onDeleteClick={handleDeleteClick} />
          )}
          RenderAllRowsMenu={(selectedIds) => (
            <MenuItems
              selectedIds={selectedIds}
              onBulkDeleteClick={handleBulkDeleteClick}
            />
          )}
          renderCard={(item) => (
            <Box className="flex flex-col h-full">
              <Flex justify="space-between" align="start">
                {StatusTextToBadge(
                  item.status,
                  true,
                  item.status === "PENDING"
                    ? "Pendente"
                    : item.status === "PAID"
                    ? "Pago"
                    : item.status === "OVERDUE"
                    ? "Atrasado"
                    : item.status === "CANCELLED"
                    ? "Cancelado"
                    : String(item.status)
                )}
                <MenuItem bill={item} onDeleteClick={handleDeleteClick} />
              </Flex>

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
                  }).format(Number(item.amount))}
                </Text>
                {item.installments && item.installments > 1 && (
                  <Badge variant="light" color="gray">
                    {item.installmentNumber}
                  </Badge>
                )}
              </Flex>
            </Box>
          )}
        />
      </div>
    </>
  );
}
