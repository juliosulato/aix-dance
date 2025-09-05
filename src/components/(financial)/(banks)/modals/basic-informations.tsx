import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { CreateBankInput, UpdateBankInput } from "@/schemas/financial/bank.schema";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
dayjs.locale("pt-br")

type Props = {
    control: Control<CreateBankInput | UpdateBankInput>;
    errors: FieldErrors<CreateBankInput | UpdateBankInput>;
    register: UseFormRegister<CreateBankInput | UpdateBankInput>;
};

export default function BankAccount__BasicInformations({ control, errors, register }: Props) {
    const t = useTranslations("financial.banks.modals");

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("subtitle")}</h2>

            <TextInput
                label={t("fields.name.label")}
                placeholder={t("fields.name.placeholder")}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={t("fields.code.label")}
                placeholder={t("fields.code.placeholder")}
                {...register("code")}
                error={errors.code?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={t("fields.agency.label")}
                placeholder={t("fields.agency.placeholder")}
                {...register("agency")}
                error={errors.agency?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={t("fields.account.label")}
                placeholder={t("fields.account.placeholder")}
                {...register("account")}
                error={errors.account?.message}
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
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
                        min={1}
                        leftSection={<RiMoneyDollarCircleFill />}
                        error={errors.maintenanceFeeAmount?.message}
                        classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
                    />
                )}
            />

            <Controller
                name="maintenanceFeeDue"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        min={1}
                        max={31}
                        allowDecimal={false}
                        placeholder="5"
                        {...field}
                        label={t("fields.maintenanceFeeDue.label")}
                        error={errors.maintenanceFeeDue?.message}
                        classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
                    />
                )}
            />

            <TextInput
                label={t("fields.description.label")}
                placeholder={t("fields.description.placeholder")}
                {...register("description")}
                error={errors.description?.message}
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />
        </div>
    );
}

