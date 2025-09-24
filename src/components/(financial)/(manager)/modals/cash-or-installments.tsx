import { CreateBillInput } from "@/schemas/financial/bill.schema";
import { FileInput, NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { localesMap } from "@/utils/locales";
import { HiOutlineUpload } from "react-icons/hi";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

type Props = {
    register: UseFormRegister<CreateBillInput>;
    control: Control<CreateBillInput>;
    errors: FieldErrors<CreateBillInput>;
    watch: UseFormWatch<CreateBillInput>;
    setValue: UseFormSetValue<CreateBillInput>;
}

export default function CashOrInstallments({ control, errors, watch }: Props) {
    const localeKey = "pt-br" as keyof typeof localesMap;
    dayjs.locale(localeKey);

    const installmentsValue = watch("paymentMode") === "INSTALLMENTS" ? watch("installments") as number : 1;

    // Conditionally set the label for the due date
    const dueDateLabel = installmentsValue > 1 
        ? "Data da 1ª parcela" 
        : "Data de Vencimento";

    return (
        <div className="border border-neutral-300 p-4 md:p-6 rounded-xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
                control={control}
                name="installments"
                render={({ field }) => (
                        <NumberInput
                        label={"Parcelas"}
                        suffix={installmentsValue > 1 ? ` ${"parcelas"}` : ""}
                        // The value from the field can be undefined initially
                        value={field.value as number | undefined}
                        onChange={(val) => field.onChange(Number(val) || 1)}
                        min={1}
                        max={24}
                        // Use a type assertion to bypass the strict union type check
                        error={(errors as any)['installments']?.message}
                        required
                        rightSection={installmentsValue === 1 ? <span className="text-xs text-gray-500">{"Parcela(s)"}</span> : <></>}
                        rightSectionWidth={installmentsValue === 1 ? 80 : 0}
                    />
                )}
            />

            <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                    <DateInput
                        label={dueDateLabel}
                        locale={localeKey}
                        onChange={(date) => {
                            if (!date) {
                                field.onChange(null);
                                return;
                            }
                            const newDate = dayjs(date).hour(12).minute(0).second(0).toDate();
                            field.onChange(newDate);
                        }}
                        value={field.value ? new Date(field.value) : null}

                        error={(errors as any)?.dueDate?.message}
                        valueFormat={"DD/MM/YYYY"}
                        required
                    />
                )}
            />

            <div className="md:col-span-2">
                                <FileInput
                                    leftSection={<HiOutlineUpload />}
                                    label={"Anexos"}
                                    placeholder={"Selecione arquivos"}
                                    multiple
                            />
            </div>
        </div>
    );
}

