import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { CreateBankInput } from "@/schemas/financial/bank.schema";

type Props = {
    control: Control<CreateBankInput>;
    errors: FieldErrors<CreateBankInput>;
    register: UseFormRegister<CreateBankInput>;
};

export default function NewBank__BasicInformations({ control, errors, register }: Props) {
    const t = useTranslations("financial.banks.modals.create");

    return (
        <div className="p-4 md:p-6 border border-neutral-300 rounded-xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("subtitle")}</h2>

            <TextInput
                label={t("fields.name.label")}
                placeholder={t("fields.name.placeholder")}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
                className="md:col-span-2"
            />

            <TextInput
                label={t("fields.code.label")}
                placeholder={t("fields.code.placeholder")}
                {...register("code")}
                error={errors.code?.message}
            />

            <TextInput
                label={t("fields.agency.label")}
                placeholder={t("fields.agency.placeholder")}
                {...register("agency")}
                error={errors.agency?.message}
            />

            <TextInput
                label={t("fields.account.label")}
                placeholder={t("fields.account.placeholder")}
                {...register("account")}
                error={errors.account?.message}
                className="md:col-span-2"
            />

            <Controller
                name="maintenanceFeeAmount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        {...field}
                        label={t("fields.maintenanceFeeAmount.label")}
                        placeholder="0,00"
                        allowDecimal
                        decimalSeparator=","
                        thousandSeparator="."
                        min={0}
                        leftSection={<RiMoneyDollarCircleFill />}
                        error={errors.maintenanceFeeAmount?.message}
                    />
                )}
            />

            <Controller
                name="maintenanceFeeDue"
                control={control}
                render={({ field }) => (
                    <DatePickerInput
                        {...field}
                        label={t("fields.maintenanceFeeDue.label")}
                        placeholder={t("fields.maintenanceFeeDue.placeholder")}
                        valueFormat="DD/MM/YYYY"
                        clearable
                        error={errors.maintenanceFeeDue?.message}
                    />
                )}
            />

            <TextInput
                label={t("fields.description.label")}
                placeholder={t("fields.description.placeholder")}
                {...register("description")}
                error={errors.description?.message}
                className="md:col-span-2"
            />
        </div>
    );
}

