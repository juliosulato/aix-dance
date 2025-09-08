import { NumberInput, Select, TextInput, Tooltip } from "@mantine/core";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreatePlanInput } from "@/schemas/plans.schema";
import { PlanType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { FaPercentage } from "react-icons/fa";
import { useEffect, useState } from "react";

type Props = {
    control: Control<CreatePlanInput>;
    errors: FieldErrors<CreatePlanInput>;
    register: UseFormRegister<CreatePlanInput>;
    amount: number;
};

export default function Plan__Fees({ control, errors, register, amount }: Props) {
    const t = useTranslations("academic.plans.modals");

    const [feeAmount, setFeeAmount] = useState<number>(0);
    const [fineAmount, setFineAmount] = useState<number>(0);
    const [discountAmount, setDiscountAmount] = useState<number>(0);

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl ">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("fees.title")}</h2>
            <br />
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("fees.title")}</h2>
            <p className="text-neutral-500">{t("fees.description")}</p>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="monthlyInterest"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label={t("fees.fields.interestPerMonth.label")}
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
                    label={t("fees.fields.interestPerMonthAmount.label")}
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
                        <Tooltip label={t("fees.fields.interestGracePeriod.tooltip")}>
                            <NumberInput
                                label={t("fees.fields.interestGracePeriod.label")}
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
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("fine.title")}</h2>
            <p className="text-neutral-500">{t("fine.description")}</p>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="finePercentage"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label={t("fine.fields.finePercentage.label")}
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
                    label={t("fine.fields.fineAmount.label")}
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
                        <Tooltip label={t("fine.fields.fineGracePeriod.tooltip")}>
                            <NumberInput
                                label={t("fine.fields.fineGracePeriod.label")}
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
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("discount.title")}</h2>
            <br />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    name="discountPercentage"
                    control={control}
                    render={({ field }) => (
                        <NumberInput
                            label={t("discount.fields.discountPercentage.label")}
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
                    label={t("discount.fields.discountAmount.label")}
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
                            label={t("discount.fields.maximumDiscountPeriod.label")}
                            id="maximumDiscountPeriod"
                            name="maximumDiscountPeriod"
                            required
                            data={[
                                { label: t("discount.fields.maximumDiscountPeriod.term.untilTheDueDate"), value: "0" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.oneDayBefore"), value: "1" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.twoDaysBefore"), value: "2" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.threeDaysBefore"), value: "3" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.fiveDaysBefore"), value: "5" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.tenDaysBefore"), value: "10" },
                                { label: t("discount.fields.maximumDiscountPeriod.term.fifteenDaysBefore"), value: "15" },

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