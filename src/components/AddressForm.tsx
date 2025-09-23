"use client";
import { TextInput } from "@mantine/core";
import { FieldErrors, UseFormRegister, FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
}

export default function Address<T extends FieldValues>({ errors, register }: Props<T>) {
    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Endereço</h2>
            <TextInput
                label="Logradouro"
                {...register("address.publicPlace" as any)}
                error={(errors.address as any)?.publicPlace?.message}
            />

            <TextInput
                label="Número"
                {...register("address.number" as any)}
                error={(errors.address as any)?.number?.message}
            />

            <TextInput
                label="Complemento"
                {...register("address.complement" as any)}
                error={(errors.address as any)?.complement?.message}
            />

            <TextInput
                label="Bairro"
                {...register("address.neighborhood" as any)}
                error={(errors.address as any)?.neighborhood?.message}
            />

            <TextInput
                label="CEP"
                {...register("address.zipCode" as any)}
                error={(errors.address as any)?.zipCode?.message}
            />

            <TextInput
                label="Cidade"
                {...register("address.city" as any)}
                error={(errors.address as any)?.city?.message}
            />

            <TextInput
                label="Estado"
                {...register("address.state" as any)}
                error={(errors.address as any)?.state?.message}
            />
        </div>
    );
}

