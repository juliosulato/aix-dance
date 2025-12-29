import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { Bank } from "@/types/bank.types";
import {  CategoryBill } from "@/types/bill.types";
import { PaymentMethod } from "@/types/bill.types";
import { Supplier } from "@/types/supplier.types";
import { fetcher } from "@/utils/fetcher";
import { NumberInput, Select, TextInput } from "@mantine/core";
import { useSession } from "next-auth/react";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import useSWR from "swr";

// Standardized Props for all form children components
type Props = {
    register: UseFormRegister<CreateBillInput>;
    control: Control<CreateBillInput>;
    errors: FieldErrors<CreateBillInput>;
    watch: UseFormWatch<CreateBillInput>;
    setValue: UseFormSetValue<CreateBillInput>;
}

export default function BasicInformations({ control, errors, register }: Props) {
    const session = useSession();

    const { data: suppliers } = useSWR<Supplier[]>(session.data?.user.tenancyId ? `/api/v1/tenancies/${session.data.user.tenancyId}/suppliers` : null, fetcher);
    const { data: categories } = useSWR<CategoryBill[]>(session.data?.user.tenancyId ? `/api/v1/tenancies/${session.data.user.tenancyId}/category-bills` : null, fetcher);
    const { data: banks } = useSWR<Bank[]>(session.data?.user.tenancyId ? `/api/v1/tenancies/${session.data.user.tenancyId}/banks` : null, fetcher);

    return (
        <div className="border border-neutral-300 p-4 md:p-6 rounded-xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <h2 className="text-lg font-semibold col-span-full">Informações Básicas</h2>
            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        label={"Valor"}
                        allowDecimal
                        decimalSeparator=","
                        required
                        min={0}
                        withAsterisk
                        value={field.value as number | undefined}
                        onChange={(val) => field.onChange(val ?? 0)}
                        leftSection={<RiMoneyDollarCircleFill />}
                        error={errors.amount?.message}
                    />
                )}
            />

            <Controller
                name="bankId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Banco"}
                        data={banks?.map((bank) => ({
                            label: bank.name, value: bank.id
                        })) || []}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.bankId?.message}
                        searchable
                        withAsterisk
                    />
                )}
            />
            <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Fornecedor"}
                        data={suppliers?.map((supplier) => ({
                            label: supplier.name, value: supplier.id
                        })) || []}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.supplierId?.message}
                        searchable
                        clearable
                    />
                )}
            />
            <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Forma de Pagamento"}
                        data={[
                            { label: "Dinheiro", value: PaymentMethod.CASH },
                            { label: "Cartão de Crédito", value: PaymentMethod.CREDIT_CARD },
                            { label: "Cartão de Débito", value: PaymentMethod.DEBIT_CARD },
                            { label: "Transferência Bancária", value: PaymentMethod.BANK_TRANSFER },
                            { label: "PIX", value: PaymentMethod.PIX },
                            { label: "Boleto", value: PaymentMethod.BANK_SLIP },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.paymentMethod?.message}
                        searchable
                        clearable
                    />
                )}
            />

            <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Categoria"}
                        data={categories?.map((category) => ({
                            label: category.name, value: category.id
                        })) || []}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.categoryId?.message}
                        searchable
                        clearable
                    />
                )}
            />

            <TextInput
                label={"Descrição"}
                error={errors.description?.message}
                {...register("description")}
                className="md:col-span-2 lg:col-span-3"
            />

            <TextInput
                label={"Complemento"}
                error={errors.complement?.message}
                {...register("complement")}
                className="md:col-span-2 lg:col-span-3"
            />
        </div>
    );
}
