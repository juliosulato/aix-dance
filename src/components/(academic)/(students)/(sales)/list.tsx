"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import DataView from "@/components/ui/DataView";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { LoadingOverlay, Text } from "@mantine/core";
import { Sale, SaleItem } from "@prisma/client";

type SaleFromApi = Sale & {
    items: SaleItem[];
};

type Props = {
    tenancyId: string;
    studentId: string;
};

export default function StudentSalesHistory({ tenancyId, studentId }: Props) {
    const { data: sessionData, status } = useSession();

    const { data: sales, error, isLoading } = useSWR<SaleFromApi[]>(
        () => (tenancyId && studentId)
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/sales?studentId=${studentId}`
            : null,
        fetcher
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;
    if (error) return <p>Erro ao carregar dados</p>;
    if (!sales || sales.length === 0) {
        return (
            <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico de Vendas</h2>
                <p className="text-center text-gray-500 py-10">Nenhuma venda encontrada</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow mt-6">
            <DataView<SaleFromApi>
                data={sales}
                pageTitle="Histórico de Vendas"
                baseUrl="/system/sales"
                searchbarPlaceholder="Buscar vendas..."
                columns={[
                    {
                        key: "createdAt",
                        label: "Data",
                        render: (value) => dayjs(value).format("DD/MM/YYYY"),
                        sortable: true,
                    },
                    {
                        key: "items",
                        label: "Itens",
                        render: (items: SaleItem[]) => (
                            <ul className="list-disc pl-5">
                                {items.map(item => <li key={item.id}>{item.description}</li>)}
                            </ul>
                        )
                    },
                    {
                        key: "totalAmount",
                        label: "Valor Total",
                        render: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                        sortable: true,
                    }
                ]}
                disableTable
                renderCard={(item) => (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <Text fw={700} size="lg" className="leading-tight">
                                    Venda #{item.id}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {dayjs(item.createdAt).format("DD/MM/YYYY")}
                                </Text>
                            </div>
                            <Text fw={700} size="lg" c="green">
                                {Number(item.totalAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Text>
                        </div>
                        <div className="mt-2 pl-2 border-l-2 border-gray-200">
                            <Text size="sm" fw={500}>Itens:</Text>
                            <ul className="list-disc pl-6 text-sm text-gray-600">
                                {item.items.map(saleItem => <li key={saleItem.id}>{saleItem.description}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
