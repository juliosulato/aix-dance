import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { fetcher } from "@/utils/fetcher";
import { NumberInput, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Bank, CategoryBill, PaymentMethod, Supplier } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("financial.bills.modals");

    const { data: suppliers } = useSWR<Supplier[]>(session.data?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.data.user.tenancyId}/suppliers` : null, fetcher);
    const { data: paymentMethods } = useSWR<PaymentMethod[]>(session.data?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.data.user.tenancyId}/payment-methods` : null, fetcher);
    const { data: categories } = useSWR<CategoryBill[]>(session.data?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.data.user.tenancyId}/category-bills` : null, fetcher);
    const { data: banks } = useSWR<Bank[]>(session.data?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.data.user.tenancyId}/banks` : null, fetcher);

    return (
        <div className="border border-neutral-300 p-4 md:p-6 rounded-xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <h2 className="text-lg font-semibold col-span-full">{t("section1-title")}</h2>
            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        label={t("fields.amount.label")}
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
                        label={t("fields.bank.label")}
                        data={banks?.map((supplier) => ({
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
                name="supplierId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.supplier.label")}
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
                name="paymentMethodId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.payment-method.label")}
                        data={paymentMethods?.map((paymentMethod) => ({
                            label: paymentMethod.name, value: paymentMethod.id
                        })) || []}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.paymentMethodId?.message}
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
                        label={t("fields.category.label")}
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
                label={t("fields.description.label")}
                error={errors.description?.message}
                {...register("description")}
                className="md:col-span-2 lg:col-span-3"
            />
        </div>
    );
}
