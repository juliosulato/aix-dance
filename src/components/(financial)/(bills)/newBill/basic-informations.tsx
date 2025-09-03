import { useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { NumberInput, Radio, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { BillStatus, BillType } from "@prisma/client";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

type Props = {
    control: Control<CreateBillInput>;
    register: UseFormRegister<CreateBillInput>;
    errors: FieldErrors<CreateBillInput>;
};

export default function NewBill__BasicInformations({ control, register, errors }: Props) {
    const t = useTranslations("financial.bills.modals.create");

    return (
        <div className="p-4 border border-neutral-300 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3">{t("basicInfoSubtitle")}</h2>
            
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Radio.Group {...field} label={t('fields.type.label')} withAsterisk error={errors.type?.message}>
                        <div className="flex gap-4 mt-2">
                            <Radio value={BillType.RECEIVABLE} label={t('fields.type.options.receivable')} />
                            <Radio value={BillType.PAYABLE} label={t('fields.type.options.payable')} />
                        </div>
                    </Radio.Group>
                )}
            />

            <TextInput
                label={t("fields.description.label")}
                placeholder={t("fields.description.placeholder")}
                {...register("description")}
                error={errors.description?.message}
                required
                withAsterisk
                className="md:col-span-2 lg:col-span-3"
            />

            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        {...field}
                        label={t("fields.amount.label")}
                        placeholder="0,00"
                        required
                        withAsterisk
                        allowDecimal
                        decimalSeparator=","
                        thousandSeparator="."
                        min={0.01}
                        leftSection={<RiMoneyDollarCircleFill />}
                        error={errors.amount?.message}
                    />
                )}
            />

            <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                    <DatePickerInput
                        {...field}
                        label={t("fields.dueDate.label")}
                        placeholder={t("fields.dueDate.placeholder")}
                        required
                        withAsterisk
                        valueFormat="DD/MM/YYYY"
                        error={errors.dueDate?.message}
                    />
                )}
            />

            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select
                        {...field}
                        label={t("fields.status.label")}
                        placeholder={t("fields.status.placeholder")}
                        required
                        withAsterisk
                        data={[
                            { value: BillStatus.PENDING, label: t('fields.status.options.pending') },
                            { value: BillStatus.PAID, label: t('fields.status.options.paid') },
                            { value: BillStatus.OVERDUE, label: t('fields.status.options.overdue') },
                            { value: BillStatus.CANCELLED, label: t('fields.status.options.cancelled') },
                        ]}
                        error={errors.status?.message}
                    />
                )}
            />
        </div>
    );
}
