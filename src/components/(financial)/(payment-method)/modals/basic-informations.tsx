import { CreateFormsOfReceiptInput, UpdateFormsOfReceiptInput } from "@/schemas/financial/forms-receipt.schema";
import { TextInput } from "@mantine/core";
import { FieldErrors, UseFormRegister } from "react-hook-form";

export default function FormsOfReceipt__BasicInformations({ register, errors }: { register: UseFormRegister<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>; errors: FieldErrors<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>; }) {
    
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold md:col-span-2">{"Texto"}</h2>
            <TextInput label={"Texto"} placeholder={"Texto"} {...register("name")} error={errors.name?.message} required withAsterisk classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300"}} />
            <TextInput label={"Texto"} placeholder={"Texto"} {...register("operator")} error={errors.operator?.message} classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300"}} />
        </div>
    );
}