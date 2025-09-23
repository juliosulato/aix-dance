"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaUser, FaFileInvoiceDollar, FaBoxOpen, FaMoneyBillWave } from "react-icons/fa";
import dayjs from "dayjs";
import { Bill, FormsOfReceipt, Plan, Sale, SaleItem, Student } from "@prisma/client";
import { Divider, Skeleton, Text } from "@mantine/core";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

// --- Tipagens para os dados que vêm da API ---
type SaleItemFromApi = SaleItem & { plan: Plan | null };

type BillFromApi = Bill & { 
    formsOfReceipt: FormsOfReceipt | null,
    children: (Bill & { formsOfReceipt: FormsOfReceipt | null })[]
};

type SaleFromApi = Sale & {
    student: Student;
    items: SaleItemFromApi[];
    bills: BillFromApi[];
};


export default function SaleView({ saleId, tenancyId }: { saleId: string, tenancyId: string }) {

    // --- Busca os dados da Venda ---
    const { data: sale, error, isLoading } = useSWR<SaleFromApi>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/sales/${saleId}`,
        fetcher
    );

    const formatCurrency = (value: number | null | undefined) => {
        if (value == null) return "-";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    // --- Tratamento de estados de carregamento e erro ---
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-6">
                <Skeleton height={30} width={200} mb="xl" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} height={50} />)}
                </div>
                <Divider my="lg" />
                <Skeleton height={20} width={150} mb="md" />
                {[...Array(2)].map((_, i) => <Skeleton key={i} height={40} mb="sm" />)}
            </div>
        );
    }

    if (error || !sale) {
        return <div className="text-center text-red-500">{"Texto"}</div>;
    }

    const mainBill = sale.bills.find(b => !b.parentId);
    const payments = mainBill?.children && mainBill.children.length > 0 ? mainBill.children : (mainBill ? [mainBill] : []);

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-6">
            {/* --- Cabeçalho --- */}
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between items-center mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
                    {"Detalhes da Venda"}
                </h1>
                <Text size="sm" c="dimmed">
                    {"Criado em"} {dayjs(sale.createdAt).format("DD/MM/YYYY")}
                </Text>
            </div>

            {/* --- Informações Gerais --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <InfoTerm label={"Texto"} icon={<FaUser />} href={`/system/academic/students/${sale.studentId}`}>
                    {sale.student.firstName} {sale.student.lastName}
                </InfoTerm>
                <InfoTerm label={"Texto"} icon={<FaFileInvoiceDollar />}>
                    {formatCurrency(sale.totalAmount as any)}
                </InfoTerm>
            </div>

            {/* --- Itens da Venda --- */}
            <div>
                <Divider my="lg" label={"Texto"} labelPosition="center" />
                <div className="flex flex-col gap-3 mt-4">
                    {sale.items.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-4">
                               <FaBoxOpen className="text-gray-400" />
                                <div>
                                    <Text size="sm" fw={500}>{item.description}</Text>
                                    <Text size="xs" c="dimmed">
                                        {item.quantity}x {formatCurrency(item.unitAmount as any)}
                                    </Text>
                                </div>
                            </div>
                            <Text size="sm" fw={500}>{formatCurrency((item.quantity as any) * (item.unitAmount as any))}</Text>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Pagamentos Realizados --- */}
            {payments.length > 0 && (
                <div>
                    <Divider my="lg" label={"Texto"} labelPosition="center" />
                    <div className="flex flex-col gap-3 mt-4">
                        {payments.map(payment => (
                             <Link href={`/system/financial/manager/${payment.id}`} key={payment.id} className="p-3 bg-gray-50 hover:bg-violet-50 rounded-lg transition-colors flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <FaMoneyBillWave className="text-green-600" />
                                    <div>
                                        <Text size="sm" fw={500}>{payment.formsOfReceipt?.name || "Forma de recebimento"}</Text>
                                        <Text size="xs" c="dimmed">
                                           {"Pago em"} {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                                        </Text>
                                    </div>
                                </div>
                                <Text size="sm" fw={500}>{formatCurrency(payment.amount as any)}</Text>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
