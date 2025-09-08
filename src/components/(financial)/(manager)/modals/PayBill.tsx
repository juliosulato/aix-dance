"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, ScrollArea, NumberInput, Select } from "@mantine/core";
import { Bill, BillStatus } from "@prisma/client";
import { KeyedMutator } from "swr";
import dayjs from "dayjs";

import { getPayBillSchema } from "@/schemas/financial/bill.schema";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { DateInput } from "@mantine/dates";
import { useLocale } from "next-intl";
import z from "zod";

// Tipagem para os dados que vêm do Zod schema
type PayBillInput = z.infer<ReturnType<typeof getPayBillSchema>>;

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
    const t = useTranslations("financial.bills.modals");
    const g = useTranslations("");
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(false);

    const payBillSchema = getPayBillSchema((key: string) => t(key as any));

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

    const { data: sessionData } = useSession();

    async function handlePayBill(data: PayBillInput) {
        if (!sessionData?.user.tenancyId || !bill) {
            notifications.show({ color: "red", message: g("general.errors.invalidSession") });
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bills/${bill.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bill");
            }

            notifications.show({ message: t("payBill.notifications.success"), color: "green" });
            onClose();
            mutate(); // Revalida o cache do SWR
        } catch (error: any) {
            console.error(error);
            notifications.show({ message: error.message || t("payBill.notifications.error"), color: "red" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (err: any) => {
        console.warn("Validation errors:", err);
        notifications.show({
            title: g("general.errors.validationTitle"),
            message: g("general.errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("payBill.title")}
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
                                    label={t("fields.paymentDate.label")}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.paymentDate?.message}
                                    locale={locale}
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
                                    label={t("fields.amountPaid.label")}
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
                                    label={t("fields.status.label")}
                                    data={[
                                        { value: BillStatus.PAID, label: t("status.PAID") },
                                        { value: BillStatus.PENDING, label: t("status.PENDING") },
                                        { value: BillStatus.OVERDUE, label: t("status.OVERDUE") },
                                        { value: BillStatus.CANCELLED, label: t("status.CANCELLED") },
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.status?.message}
                                    required
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
                        {g("forms.submit")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
