import { CreateBillInput, UpdateBillInput } from "@/schemas/financial/bill.schema";
import { NumberInput, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { RecurrenceType } from "@/types/bill.types";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import dayjs from "dayjs";
import { dateParser } from "@/utils/dateParser";

type Props = {
    register: UseFormRegister<CreateBillInput | UpdateBillInput>;
    control: Control<CreateBillInput | UpdateBillInput>;
    errors: FieldErrors<CreateBillInput | UpdateBillInput>;
    watch: UseFormWatch<CreateBillInput | UpdateBillInput>;
    setValue: UseFormSetValue<CreateBillInput | UpdateBillInput>;
}

export default function Subscription({ control, errors, watch }: Props) {
    const endCondition = watch("paymentMode") === "SUBSCRIPTION" ? watch("endCondition") : "noDateSet";

    return (
        <div className="form-card-grid">
            <Controller
                control={control}
                name="recurrence"
                render={({ field }) => (
                    <Select
                        label={"Recorrência"}
                        placeholder={"Selecione a recorrência"}
                        required
                        data={[
                            { label: "Mensal", value: RecurrenceType.MONTHLY },
                            { label: "Bimestral", value: RecurrenceType.BIMONTHLY },
                            { label: "Trimestral", value: RecurrenceType.QUARTERLY },
                            { label: "Semestral", value: RecurrenceType.SEMIANNUAL },
                            { label: "Anual", value: RecurrenceType.ANNUAL },
                        ]}
                        value={field.value as RecurrenceType | undefined}
                        onChange={field.onChange}
                        error={(errors as any)['recurrence']?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                    <DateInput
                        {...field}
                        label={"Data do 1º Vencimento"}
                        value={field.value}
                        error={(errors as any)?.dueDate?.message}
                        valueFormat={"DD/MM/YYYY"}
                        required
                    />
                )}
            />

            <Controller
                control={control}
                name="endCondition"
                render={({ field }) => (
                    <Select
                        label={"Condição de Término"}
                        data={[
                            { label: "Sem data de término", value: "noDateSet" },
                            { label: "Escolher data", value: "chooseData" },
                            { label: "Número de cobranças", value: "numberOfCharges" }
                        ]}
                        value={field.value as "noDateSet" | "chooseData" | "numberOfCharges" | undefined}
                        onChange={field.onChange}
                        className="md:col-span-2"
                    />
                )}
            />

            {(endCondition as any) === 'chooseData' && (
                <Controller
                    control={control}
                    name="recurrenceEndDate"
                    render={({ field }) => (
                        <DateInput
                            label={"Data de Término"}
                            locale={"pt-br"}
                            onChange={(date) => {
                                if (!date) {
                                    field.onChange(null);
                                    return;
                                }
                                const newDate = dayjs(date).hour(12).minute(0).second(0).toDate();
                                field.onChange(newDate);
                            }} value={field.value ? new Date(field.value as Date) : null}
                            error={(errors as any)['recurrenceEndDate']?.message}
                            valueFormat={"DD/MM/YYYY"}
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
                            label={"Quantidade de cobranças"}
                            suffix={` ${"cobranças"}`}
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

