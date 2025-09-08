import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { NumberInput, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { RecurrenceType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { localesMap } from "@/utils/locales";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/es";
import "dayjs/locale/en";

// Standardized Props for all form children components
type Props = {
    register: UseFormRegister<CreateBillInput>;
    control: Control<CreateBillInput>;
    errors: FieldErrors<CreateBillInput>;
    watch: UseFormWatch<CreateBillInput>;
    setValue: UseFormSetValue<CreateBillInput>;
}

export default function Subscription({ control, errors, watch }: Props) {
    const t = useTranslations("financial.bills.modals");
    const locale = useLocale();
    dayjs.locale(locale);

    const endCondition = watch("paymentMode") === "SUBSCRIPTION" ? watch("endCondition") : "noDateSet";

    const recurrenceTypes = Object.values(RecurrenceType).filter(type => type !== "NONE");

    return (
        <div className="border border-neutral-300 p-4 md:p-6 rounded-xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
                control={control}
                name="recurrence"
                render={({ field }) => (
                    <Select
                        label={t("fields.subscription.frequency.label")}
                        placeholder={t("fields.subscription.frequency.placeholder")}
                        required
                        data={recurrenceTypes.map(type => ({
                            label: t(`fields.subscription.frequency.recurrenceTypes.${type}`),
                            value: type,
                        }))}
                        value={field.value as RecurrenceType | undefined}
                        onChange={field.onChange}
                        // Use a type assertion to bypass the strict union type check
                        error={(errors as any)['recurrence']?.message}
                    />
                )}
            />
            
            <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                    <DateInput
                        label={t("fields.subscription.dueDate.label")}
                        locale={locale}
                        onChange={field.onChange}
                        value={field.value ? new Date(field.value) : null}
                        error={errors?.dueDate?.message}
                        valueFormat={t("fields.dueDate.valueFormat")}
                        required
                    />
                )}
            />

            <Controller
                control={control}
                name="endCondition"
                render={({ field }) => (
                    <Select
                        label={t("fields.subscription.endOfSubscription.label")}
                        data={[
                            { label: t("fields.subscription.endCondition.noDateSet"), value: "noDateSet" },
                            { label: t("fields.subscription.endCondition.chooseData"), value: "chooseData" },
                            { label: t("fields.subscription.endCondition.numberOfCharges"), value: "numberOfCharges" }
                        ]}
                        value={field.value as "noDateSet" | "chooseData" | "numberOfCharges" | undefined}
                        onChange={field.onChange}
                        className="md:col-span-2"
                    />
                )}
            />

            {/* Conditional Fields based on endCondition */}
            {endCondition === 'chooseData' && (
                <Controller
                    control={control}
                    name="recurrenceEndDate"
                    render={({ field }) => (
                         <DateInput
                            label={t("fields.subscription.chooseData.label")}
                            locale={locale}
                            onChange={field.onChange}
                            value={field.value ? new Date(field.value as Date) : null}
                            // Use a type assertion to bypass the strict union type check
                            error={(errors as any)['recurrenceEndDate']?.message}
                            valueFormat={t("fields.dueDate.valueFormat")}
                            required
                        />
                    )}
                />
            )}

            {endCondition === 'numberOfCharges' && (
                <Controller
                    control={control}
                    name="recurrenceCount"
                    render={({ field }) => (
                        <NumberInput
                            label={t("fields.subscription.numberOfCharges.label")}
                            suffix={` ${t("fields.subscription.numberOfCharges.suffix")}`}
                            value={field.value as number | undefined}
                            onChange={(val) => field.onChange(Number(val))}
                            min={1}
                            error={(errors as any)['recurrenceCount']?.message}
                            required
                        />
                    )}
                />
            )}
        </div>
    );
}

