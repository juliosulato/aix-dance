"use client";
import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister, FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
}

export default function Address<T extends FieldValues>({ errors, register }: Props<T>) {
    const f = useTranslations("forms.address");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{f("title")}</h2>
            <TextInput
                label={f("publicPlace.label")}
                {...register("address.publicPlace" as any)}
                error={(errors.address as any)?.publicPlace?.message}
            />

            <TextInput
                label={f("number.label")}
                {...register("address.number" as any)}
                error={(errors.address as any)?.number?.message}
            />

            <TextInput
                label={f("complement.label")}
                {...register("address.complement" as any)}
                error={(errors.address as any)?.complement?.message}
            />

            <TextInput
                label={f("neighborhood.label")}
                {...register("address.neighborhood" as any)}
                error={(errors.address as any)?.neighborhood?.message}
            />

            <TextInput
                label={f("zipCode.label")}
                {...register("address.zipCode" as any)}
                error={(errors.address as any)?.zipCode?.message}
            />

            <TextInput
                label={f("city.label")}
                {...register("address.city" as any)}
                error={(errors.address as any)?.city?.message}
            />

            <TextInput
                label={f("state.label")}
                {...register("address.state" as any)}
                error={(errors.address as any)?.state?.message}
            />
        </div>
    );
}

