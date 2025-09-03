import { CreatePaymentMethodInput } from "@/schemas/financial/payment-method.schema";
import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister } from "react-hook-form";

export default function NewPaymentMethod__BasicInformations({ register, errors }: { register: UseFormRegister<CreatePaymentMethodInput>; errors: FieldErrors<CreatePaymentMethodInput>; }) {
    const t = useTranslations("financial.paymentMethods.modals.create");
    return (
        <div className="p-4 border border-neutral-300 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-lg font-bold md:col-span-2">{t("basicInfoSubtitle")}</h2>
            <TextInput label={t("fields.name.label")} placeholder={t("fields.name.placeholder")} {...register("name")} error={errors.name?.message} required withAsterisk />
            <TextInput label={t("fields.operator.label")} placeholder={t("fields.operator.placeholder")} {...register("operator")} error={errors.operator?.message} />
        </div>
    );
}