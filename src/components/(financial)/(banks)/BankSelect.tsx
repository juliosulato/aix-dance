import { fetcher } from "@/utils/fetcher";
import { Bank } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, FieldValues, Path } from "react-hook-form";
import useSWR from "swr";
import { Select } from "@mantine/core";

// Standardized Props for all form children components
export type BankSelectProps<T extends FieldValues> = {
    control: Control<T>;
    errors: FieldErrors<T>;
    name: Path<T>;
    label?: string;
    required?: boolean;
};

export function BankSelect<T extends FieldValues>({ control, errors, name, label, required }: BankSelectProps<T>) {
    const session = useSession();
    const t = useTranslations("financial.bills.modals");
    const { data: banks } = useSWR<Bank[]>(session.data?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.data.user.tenancyId}/banks` : null, fetcher);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Select
                    label={label || t("fields.bank.label")}
                    data={banks?.map((bank) => ({ label: bank.name, value: bank.id })) || []}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors[name]?.message as string}
                    searchable
                    withAsterisk={required}
                />
            )}
        />
    );
}
