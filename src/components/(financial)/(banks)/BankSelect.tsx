import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { Control, Controller, FieldErrors, FieldValues, Path } from "react-hook-form";
import useSWR from "swr";
import { Select } from "@mantine/core";
import { Bank } from "@/types/bank.types";

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
    const { data: banks } = useSWR<Bank[]>(session.data?.user.tenancyId ? `/api/v1/tenancies/${session.data.user.tenancyId}/banks` : null, fetcher);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Select
                    label={label || "Banco"}
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
