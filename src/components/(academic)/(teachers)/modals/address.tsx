"use client";
import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister, FieldValues, Path } from "react-hook-form";

type Props<T extends FieldValues> = {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    fieldPath: Path<T>;
}

export default function Address<T extends FieldValues>({ errors, register, fieldPath }: Props<T>) {
    const f = useTranslations("forms.address");

    const getError = (fieldName: string) => {
        const path = `${fieldPath}.${fieldName}`.split('.');
        let current: any = errors;
        for (const key of path) {
            if (current && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        return current?.message;
    };


    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{f("title")}</h2>

            {/* Os campos agora são registrados dinamicamente usando o fieldPath */}
            <TextInput
                label={f("zipCode.label")}
                {...register(`${fieldPath}.zipCode` as any)}
                error={getError("zipCode")}
            />
            <TextInput
                label={f("publicPlace.label")}
                {...register(`${fieldPath}.publicPlace` as any)}
                error={getError("publicPlace")}
            />
            <TextInput
                label={f("number.label")}
                {...register(`${fieldPath}.number` as any)}
                error={getError("number")}
            />
            <TextInput
                label={f("complement.label")}
                {...register(`${fieldPath}.complement` as any)}
                error={getError("complement")}
            />
            <TextInput
                label={f("neighborhood.label")}
                {...register(`${fieldPath}.neighborhood` as any)}
                error={getError("neighborhood")}
            />
            <TextInput
                label={f("city.label")}
                {...register(`${fieldPath}.city` as any)}
                error={getError("city")}
            />
            <TextInput
                label={f("state.label")}
                {...register(`${fieldPath}.state` as any)}
                error={getError("state")}
            />
        </div>
    );
}
