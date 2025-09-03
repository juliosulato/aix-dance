import { useTranslations } from "next-intl";
import { Control, Controller, UseFormRegister } from "react-hook-form";
import { NumberInput, Select } from "@mantine/core";
import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { RecurrenceType } from "@prisma/client";

type Props = {
    control: Control<CreateBillInput>;
    register: UseFormRegister<CreateBillInput>;
};

export default function NewBill__Recurrence({ control, register }: Props) {
    const t = useTranslations("financial.bills.modals.create");

    return (
        <div className="p-4 border border-neutral-300 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
             <h2 className="text-lg font-bold md:col-span-2">{t("recurrenceSubtitle")}</h2>
            
            <Controller
                name="installments"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        {...field}
                        label={t('fields.installments.label')}
                        min={1}
                        allowDecimal={false}
                    />
                )}
            />

            <Controller
                name="recurrence"
                control={control}
                render={({ field }) => (
                    <Select
                        {...field}
                        label={t('fields.recurrence.label')}
                        placeholder={t('fields.recurrence.placeholder')}
                        clearable
                        data={[
                            { value: RecurrenceType.NONE, label: t('fields.recurrence.options.none') },
                            { value: RecurrenceType.MONTHLY, label: t('fields.recurrence.options.monthly') },
                            { value: RecurrenceType.BIMONTHLY, label: t('fields.recurrence.options.bimonthly') },
                            { value: RecurrenceType.QUARTERLY, label: t('fields.recurrence.options.quarterly') },
                            { value: RecurrenceType.SEMIANNUAL, label: t('fields.recurrence.options.semiannual') },
                            { value: RecurrenceType.ANNUAL, label: t('fields.recurrence.options.annual') },
                        ]}
                    />
                )}
            />
        </div>
    );
}
