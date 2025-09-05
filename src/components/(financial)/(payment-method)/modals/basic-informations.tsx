import { CreatePaymentMethodInput, UpdatePaymentMethodInput } from "@/schemas/financial/payment-method.schema";
import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister } from "react-hook-form";

export default function PaymentMethod__BasicInformations({ register, errors }: { register: UseFormRegister<CreatePaymentMethodInput | UpdatePaymentMethodInput>; errors: FieldErrors<CreatePaymentMethodInput | UpdatePaymentMethodInput>; }) {
    const t = useTranslations("financial.payment-methods.modals");
    
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold md:col-span-2">{t("basicInfoSubtitle")}</h2>
            <TextInput label={t("fields.name.label")} placeholder={t("fields.name.placeholder")} {...register("name")} error={errors.name?.message} required withAsterisk classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300"}} />
            <TextInput label={t("fields.operator.label")} placeholder={t("fields.operator.placeholder")} {...register("operator")} error={errors.operator?.message} classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300"}} />
        </div>
    );
}