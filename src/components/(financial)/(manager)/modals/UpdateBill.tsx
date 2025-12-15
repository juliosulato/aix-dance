"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, ScrollArea, SegmentedControl, Tabs, Text } from "@mantine/core";
import { Bill, BillStatus, RecurrenceType } from "@prisma/client";
import { KeyedMutator } from "swr";

import { UpdateBillInput, updateBillSchema } from "@/schemas/financial/bill.schema";
import BasicInformations from "./basic-informations";
import CashOrInstallments from "./cash-or-installments";
import { FaEdit } from "react-icons/fa";

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

export default function UpdateBill({ opened, onClose, mutate, bill }: Props) {

    const [isLoading, setIsLoading] = useState(false);
    const [updateScope, setUpdateScope] = useState<'ONE' | 'ALL_FUTURE'>('ONE');

    // Usamos o schema estático

    const { control, handleSubmit, formState: { errors }, register, reset, watch, setValue } = useForm<UpdateBillInput>({
        resolver: zodResolver(updateBillSchema) as any,
    });

    useEffect(() => {
        if (bill) {
            reset({
                amount: Number(bill.amount),
                description: bill.description,
                status: bill.status,
                dueDate: bill.dueDate ? new Date(bill.dueDate) : undefined,
                paymentDate: bill.paymentDate ? new Date(bill.paymentDate) : undefined,
                supplierId: bill.supplierId || undefined,
                categoryId: bill.categoryId || undefined,
                bankId: bill.bankId || undefined,
                installments: bill.installments || undefined,
                recurrence: bill.recurrence || undefined,
                recurrenceEndDate: bill.recurrenceEndDate ? new Date(bill.recurrenceEndDate) : undefined,
                recurrenceCount: bill.recurrenceCount || undefined,
            });
        }
    }, [bill, reset]);

    const { data: sessionData } = useSession();

    async function handleUpdateBill(data: UpdateBillInput) {
        if (!sessionData?.user.tenancyId || !bill) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            // Inclui o escopo da atualização no payload
            const payload = { ...data, updateScope };

            const response = await fetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/bills/${bill.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bill");
            }

            notifications.show({ message: "Conta atualizada com sucesso.", color: "green" });
            onClose();
            mutate(); // Revalida o cache do SWR
        } catch (error: any) {
            console.error(error);
            notifications.show({ message: error.message || "Erro ao atualizar a conta.", color: "red" });
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

    const isSeries = !!bill?.parentId || (bill?.children && bill.children.length > 0);


    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Editar Conta"
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(handleUpdateBill, handleFormErrors)}>
                <LoadingOverlay visible={isLoading} />
                <ScrollArea.Autosize mah="70vh" type="always" p="xs">
                    <div className="space-y-6">
                        <BasicInformations control={control as any} errors={errors as any} register={register as any} setValue={setValue as any} watch={watch as any} />
                        {isSeries ? (
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <FaEdit className="mx-auto text-gray-400 text-2xl mb-2" />
                                <Text size="sm" c="dimmed">Esta conta faz parte de uma série. Escolha como deseja aplicar as alterações.</Text>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Opções de Pagamento</h2>
                                <CashOrInstallments control={control as any} errors={errors as any} register={register as any} setValue={setValue as any} watch={watch as any}  />
                            </div>
                        )}
                    </div>
                </ScrollArea.Autosize>

                <div className="flex items-center justify-between pt-6">
                    {isSeries && (
                        <div>
                            <Text size="sm" fw={500} mb={4}>Aplicar alterações</Text>
                            <SegmentedControl
                                value={updateScope}
                                onChange={(value) => setUpdateScope(value as 'ONE' | 'ALL_FUTURE')}
                                data={[
                                    { label: "Apenas esta conta", value: 'ONE' },
                                    { label: "Esta e todas as futuras", value: 'ALL_FUTURE' },
                                ]}
                                color="#7439FA"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="md"
                        loading={isLoading}
                        className="!text-sm !font-medium tracking-wider ml-auto"
                    >
                        Salvar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

