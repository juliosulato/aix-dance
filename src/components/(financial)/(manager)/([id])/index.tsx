"use client";

import InfoTerm from "@/components/ui/Infoterm";
import {
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUniversity,
  FaCreditCard,
  FaUser,
  FaTag,
  FaFileInvoiceDollar,
  FaReceipt,
  FaLink,
} from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteBills from "../delete";
import UpdateBill from "../modals/UpdateBill";
import dayjs from "dayjs";
import { BillFromApi } from "..";

// Local augmentation: the API returns attachments for bills; add a minimal type
type Attachment = { id: string; url: string; createdAt: string };
type BillWithAttachments = BillFromApi & { attachments?: Attachment[] };
import { StatusTextToBadge } from "@/utils/statusTextToBadge";
import { Divider, Flex, Text } from "@mantine/core";
import Link from "next/link";
import { Button } from "@mantine/core";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import PayBill from "../modals/PayBill";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

export default function BillView({ id }: { id: string }) {
  const session = useSession();
  const tenancyId = session?.data?.user.tenancyId as string;
  const { data: bill, error } = useSWR<BillFromApi>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/bills/${id}`,
    fetcher
  );

  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [openPayBill, setOpenPayBill] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBills([bill?.id || "-"], tenancyId);
      window.location.replace("/system/financial/manager");
    } catch (error) {
      console.error("Falha ao excluir a conta:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isInstallmentParent =
    bill?.children && bill?.children.length > 0 && bill?.installments > 1;

    if (error) {
        console.error("Falha ao carregar os dados da conta:", error);
        return <div>Falha ao carregar os dados da conta.</div>;
    }

    if (!bill) {
        return <div>Carregando...</div>;
    }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between items-center mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          Detalhes da Conta
        </h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setConfirmModalOpen(true)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setOpenUpdate(true)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
          {bill.status !== "PAID" && (
            <button
              className="text-green-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
              onClick={() => setOpenPayBill(true)}
            >
              <RiMoneyDollarCircleLine />
              <span>{"Pagar"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <InfoTerm label={"Descrição"} icon={<FaFileInvoiceDollar />}>
          {bill.description}
        </InfoTerm>
        <InfoTerm label={"Status"}>
          {StatusTextToBadge(bill.status, true, {
            PENDING: "Pendente",
            PAID: "Pago",
            OVERDUE: "Atrasado",
            CANCELLED: "Cancelado",
          })}
        </InfoTerm>
        <InfoTerm label={"Valor"} icon={<FaFileInvoiceDollar />}>
          {formatCurrency(bill.amount)}
        </InfoTerm>
        <InfoTerm label={"Vencimento"} icon={<FaCalendarAlt />}>
          {dayjs(bill.dueDate).format("DD/MM/YYYY")}
        </InfoTerm>
        <InfoTerm label={"Fornecedor"} icon={<FaUser />}>
          {bill.supplier?.name}
        </InfoTerm>
        <InfoTerm label={"Categoria"} icon={<FaTag />}>
          {bill.category?.name}
        </InfoTerm>
        <InfoTerm label={"Forma de Pagamento"} icon={<FaCreditCard />}>
          {bill.formsOfReceipt?.name}
        </InfoTerm>
        <InfoTerm label={"Banco"} icon={<FaUniversity />}>
          {bill.bank?.name}
        </InfoTerm>

        {bill.status === "PAID" && (
          <>
            <InfoTerm label={"Valor Pago"} icon={<FaReceipt />}>
              {formatCurrency(bill.amountPaid)}
            </InfoTerm>
            <InfoTerm label={"Data de Pagamento"} icon={<FaCalendarAlt />}>
              {bill.paymentDate
                ? dayjs(bill.paymentDate).format("DD/MM/YYYY")
                : "-"}
            </InfoTerm>
          </>
        )}

        {bill.parentId && (
          <InfoTerm
            label="Conta Principal"
            icon={<FaLink />}
            href={`/system/financial/manager/${bill.parentId}`}
          >
            Ver transação original
          </InfoTerm>
        )}
        {bill.parentId && (
          <InfoTerm
            label="Conta Principal"
            icon={<FaLink />}
            href={`/system/financial/manager/${bill.parentId}`}
          >
            Ver transação original
          </InfoTerm>
        )}

        {/* ADICIONADO: Link para a venda associada */}
        {bill.saleId && (
          <InfoTerm
            label="Venda de Origem"
            icon={<FaLink />}
            href={`/system/sales/${bill.saleId}`}
          >
            Ver venda #{bill.saleId}
          </InfoTerm>
        )}
      </div>

      {isInstallmentParent && (
        <div>
          <Divider my="lg" label="Parcelas Associadas" labelPosition="center" />
          <div className="flex flex-col gap-3 mt-4">
            {bill.children.map((child) => (
              <Link
                href={`/system/financial/manager/${child.id}`}
                key={child.id}
                className="p-3 bg-gray-50 hover:bg-violet-50 rounded-lg transition-colors flex justify-between items-center"
              >
                <div>
                  <Text size="sm" fw={500}>
                    {child.installmentNumber}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Vencimento: {dayjs(child.dueDate).format("DD/MM/YYYY")}
                  </Text>
                </div>
                <Flex align="center" gap="lg">
                  <Text size="sm" fw={500}>
                    {formatCurrency(child.amount)}
                  </Text>
                  {StatusTextToBadge(child.status, true, {
                    PENDING: "Pendente",
                    PAID: "Pago",
                    OVERDUE: "Atrasado",
                    CANCELLED: "Cancelado",
                  })}
                </Flex>
              </Link>
            ))}
          </div>
        </div>
      )}

      <UpdateBill
        bill={bill as any}
        onClose={() => setOpenUpdate(false)}
        opened={openUpdate}
        mutate={() => window.location.reload() as any}
      />
      <PayBill
        bill={bill as any}
        onClose={() => setOpenPayBill(false)}
        opened={openPayBill}
        mutate={() => window.location.reload() as any}
      />
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {`Tem certeza de que deseja excluir a conta com vencimento em ${
          dayjs(bill?.dueDate).format("DD/MM/YYYY") || ""
        }?`}
      </ConfirmationModal>
      {/* Attachments list with download buttons */}
  {((bill as any) as BillWithAttachments).attachments && ((bill as any) as BillWithAttachments).attachments!.length > 0 && (
        <div>
          <Divider my="lg" label="Anexos" labelPosition="center" />
          <div className="flex flex-col gap-3 mt-4">
            {((bill as any) as BillWithAttachments).attachments!.map((att: Attachment) => (
              <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Text size="sm" fw={500}>{att.url.split('/').pop()}</Text>
                  <Text size="xs" c="dimmed">Anexado em: {dayjs(att.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="light" onClick={async () => {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/bill-attachments/${att.id}/url`);
                      if (!res.ok) throw new Error('Failed to fetch attachment URL');
                      const data = await res.json();
                      const url = data.url || att.url;
                      window.open(url, '_blank');
                    } catch (e) {
                      console.error('Download failed', e);
                      // fallback: open stored URL
                      window.open(att.url, '_blank');
                    }
                  }}>Baixar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
