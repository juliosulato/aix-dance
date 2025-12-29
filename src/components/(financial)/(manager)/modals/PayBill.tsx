"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { authedFetch } from "@/utils/authedFetch";
import { Button, LoadingOverlay, Modal, ScrollArea, NumberInput, Select } from "@mantine/core";
import { Bill, BillStatus } from "@/types/bill.types";
import { Bank } from "@/types/bank.types";
import useSWR, { KeyedMutator } from "swr";
import dayjs from "dayjs";

import { payBillSchema, PayBillInput } from "@/schemas/financial/bill.schema";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { DateInput } from "@mantine/dates";
import { fetcher } from "@/utils/fetcher";

// Tipagem para os dados que vêm do Zod schema
// type PayBillInput já importado do schema

export type BillFromApi = Omit<Bill, 'dueDate' | 'paymentDate' | 'recurrenceEndDate' | 'createdAt' | 'updatedAt'> & {
    dueDate: string;
    paymentDate: string | null;
    recurrenceEndDate: string | null;
    createdAt: string;
    updatedAt: string;
    children: BillFromApi[];
};

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<any>;
    bill: BillFromApi | null;
};

export default function PayBill({ opened, onClose, mutate, bill }: Props) {

    const [isLoading, setIsLoading] = useState(false);

    // Usamos o schema estático
    const { data: sessionData } = useSession();
    
    const { data: banks } = useSWR<Bank[]>(`/api/v1/tenancies/${sessionData?.user.tenancyId}/banks`, fetcher);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<PayBillInput>({
        resolver: zodResolver(payBillSchema),
    });

    useEffect(() => {
        if (bill) {
            // Preenche o formulário com os dados da conta ao abrir o modal
            reset({
                status: BillStatus.PAID, // Sugere o status como "Pago"
                amountPaid: Number(bill.amount), // Sugere o valor total da conta
                paymentDate: dayjs().toDate(), // Sugere a data de hoje para o pagamento
            });
        }
    }, [bill, reset]);


    async function handlePayBill(data: PayBillInput) {
        if (!sessionData?.user.tenancyId || !bill) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            // O payload só precisa dos campos do schema de pagamento
            const payload = {
                status: data.status,
                amountPaid: data.amountPaid,
                paymentDate: data.paymentDate,
            };

            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/bills/${bill.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bill");
            }

            notifications.show({ message: "Conta paga com sucesso", color: "green" });
            onClose();
            mutate(); // Revalida o cache do SWR
        } catch (error: any) {
            console.error(error);
            notifications.show({ message: error.message || "Erro ao pagar conta", color: "red" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (err: any) => {
        console.warn("Validation errors:", err);
        notifications.show({
            title: "Erro de validação",
            message: "Verifique os dados informados",
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Pagar Conta"
            size="lg" // Tamanho menor, pois são poucos campos
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(handlePayBill, handleFormErrors)}>
                <LoadingOverlay visible={isLoading} />
                <ScrollArea.Autosize mah="70vh" type="always" p="xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <Controller
                            name="paymentDate"
                            control={control}
                            render={({ field }) => (
                                <DateInput
                                    label="Data de pagamento"
                                    value={field.value}
                                    onChange={(date) => {
                                        if (!date) {
                                            field.onChange(null);
                                            return;
                                        }
                                        const newDate = dayjs(date).hour(12).minute(0).second(0).toDate();
                                        field.onChange(newDate);
                                    }} error={errors.paymentDate?.message}
                                    locale={"pt-br"}
                                    required
                                    className="w-full"
                                />
                            )}
                        />

                        <Controller
                            name="amountPaid"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Valor pago"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.amountPaid?.message}
                                    leftSection={<RiMoneyDollarCircleFill />}
                                    allowDecimal
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    min={0}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Status"
                                    data={[
                                        { value: BillStatus.PAID, label: "Pago" },
                                        { value: BillStatus.PENDING, label: "Pendente" },
                                        { value: BillStatus.OVERDUE, label: "Vencido" },
                                        { value: BillStatus.CANCELLED, label: "Cancelado" },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.status?.message}
                                    required
                                    className="md:col-span-2"
                                />
                            )}
                        />


                        <Controller
                            control={control}
                            name="bankId"
                            render={({ field }) => (
                                <Select
                                    label="Banco"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.bankId?.message}
                                    searchable
                                    clearable
                                    data={banks?.map((bank) => ({ label: bank.name, value: bank.id })) || []}
                                    placeholder="Selecione o banco"
                                    className="md:col-span-2"
                                />
                            )}
                        />
                    </div>
                </ScrollArea.Autosize>

                <div className="flex justify-end pt-6 mt-4 border-t border-neutral-200">
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="md"
                        loading={isLoading}
                        className="!text-sm !font-medium tracking-wider"
                    >
                        Pagar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
