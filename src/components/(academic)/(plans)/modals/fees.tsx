import { NumberInput, Select, TextInput, Tooltip } from "@mantine/core";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { CreatePlanInput } from "@/schemas/plans.schema";
import { FaPercentage } from "react-icons/fa";
import { useState } from "react";

type Props = {
    control: Control<CreatePlanInput>;
    errors: FieldErrors<CreatePlanInput>;
    amount: number;
    register?: any;
};

export default function Plan__Fees({ control, errors, amount }: Props) {

    const [feeAmount, setFeeAmount] = useState<number>(0);
    const [fineAmount, setFineAmount] = useState<number>(0);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl ">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Juros</h2>
            <br />
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Juros</h2>
            <p className="text-neutral-500">Aplique juros para quando o pagamento não ocorrer até a data de vencimento. Os juros acumulativos serão somados diariamente ao valor da parcela até o pagamento.</p>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="monthlyInterest"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label="Juros ao mês"
                            allowDecimal
                            decimalSeparator=","
                            required
                            min={0}
                            withAsterisk
                            value={field.value}
                            suffix="%"
                            onChange={(val) => {
                                field.onChange(val ?? 0);
                                setFeeAmount(Number(val));
                            }}
                            leftSection={<FaPercentage />}
                        />
                    )}
                />

                <TextInput
                    label="Valor de juros ao mês"
                    error={errors.name?.message}
                    required
                    withAsterisk
                    value={(amount * (feeAmount / 100)).toFixed(2).replace(/\./g, ",")}
                    leftSection={<RiMoneyDollarCircleFill />}
                    disabled
                    classNames={{ input: "!text-neutral-900" }}
                />
                <Controller
                    name="interestGracePeriod"
                    control={control}
                    render={({ field }) => (
                        <Tooltip label="Número de dias de tolerância após o vencimento antes da cobrança automática de juros.">
                            <NumberInput
                                label="Carência (dias)"
                                id="interestGracePeriod"
                                name="interestGracePeriod"
                                required
                                min={0}
                                value={field.value ?? 0}
                                onChange={field.onChange}
                                className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                            />
                        </Tooltip>
                    )}
                />
            </div>
            <hr className="my-6 border-neutral-300" />
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Multa</h2>
            <p className="text-neutral-500">A multa será somada ao valor da parcela caso o pagamento seja feito após a data do vencimento.</p>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="finePercentage"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label="Valor percentual de multa"
                            allowDecimal
                            decimalSeparator=","
                            required
                            min={0}
                            withAsterisk
                            value={field.value}
                            suffix="%"
                            onChange={(val) => {
                                field.onChange(val);
                                setFineAmount(Number(val))
                            }}
                            leftSection={<FaPercentage />}
                        />
                    )}
                />
                <TextInput
                    label="Valor total da multa"
                    error={errors.name?.message}
                    required
                    withAsterisk
                    disabled
                    leftSection={<RiMoneyDollarCircleFill />}
                    classNames={{ input: "!text-neutral-900" }}
                    value={(amount * (fineAmount / 100)).toFixed(2).replace(/\./g, ",")}

                />
                <Controller
                    name="fineGracePeriod"
                    control={control}
                    render={({ field }) => (
                        <Tooltip label="Número de dias de tolerância após o vencimento antes da cobrança automática de multa.">
                            <NumberInput
                                label="Carência (dias)"
                                id="fineGracePeriod"
                                name="fineGracePeriod"
                                required
                                min={0}
                                value={field.value ?? 0}
                                onChange={field.onChange}
                                className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                            />
                        </Tooltip>
                    )}
                />
            </div>
            <hr className="my-6 border-neutral-300" />
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">Desconto</h2>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="discountPercentage"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label="Valor percentual do desconto"
                            allowDecimal
                            decimalSeparator=","
                            required
                            min={0}
                            withAsterisk
                            value={field.value}
                            suffix="%"
                            onChange={(val) => {
                                field.onChange(val ?? 0);
                                setDiscountAmount(Number(val) ?? 0);
                            }}
                            leftSection={<FaPercentage />}
                        />
                    )}
                />

                <TextInput
                    label="Valor do desconto"
                    error={errors.name?.message}
                    required
                    withAsterisk
                    leftSection={<RiMoneyDollarCircleFill />}
                    disabled
                    classNames={{ input: "!text-neutral-900" }}
                    value={(amount * (discountAmount / 100)).toFixed(2).replace(/\./g, ",")}
                />
                <Controller
                    name="maximumDiscountPeriod"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Prazo Máximo"
                            id="maximumDiscountPeriod"
                            name="maximumDiscountPeriod"
                            required
                            data={[
                                { label: "Até o dia do vencimento", value: "0" },
                                { label: "1 dia antes", value: "1" },
                                { label: "2 dias antes", value: "2" },
                                { label: "3 dias antes", value: "3" },
                                { label: "5 dias antes", value: "5" },
                                { label: "10 dias antes", value: "10" },
                                { label: "15 dias antes", value: "15" },

                            ]}
                            value={field.value?.toString() ?? ""}
                            onChange={field.onChange}
                            className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        />
                    )}
                />
            </div>
        </div>
    )
}
