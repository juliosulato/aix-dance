"use client";

import { Button, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { PlanType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useState } from "react";


type Props = {
    opened: boolean;
    onClose?: () => void;
}

export default function NewPlan({ opened, onClose }: Props) {
    const t = useTranslations("plans.modals.create");
    const g = useTranslations("");

    const [frequency, setFrequency] = useState<number>(1);

    return (
        <Modal opened={opened} onClose={onClose} title={t("title")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
            <form className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] " >
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4" >{t("subtitle")}</h2>
                    <TextInput
                        label={t("fields.name.label")}
                        id="name"
                        name="name"
                        placeholder={t("fields.name.placeholder")}
                        required
                        withAsterisk
                    />
                    <NumberInput
                        label={t("fields.frequency.label")}
                        id="frequency"
                        name="frequency"
                        placeholder={t("fields.frequency.placeholder")}
                        required
                        withAsterisk
                        suffix={t("fields.frequency.suffix")}
                        onChange={(value) => setFrequency(Number(value))}
                        value={frequency}
                        min={1}
                        allowDecimal={false}
                    />
                    <NumberInput
                        label={t("fields.amount.label")}
                        id="amount"
                        name="amount"
                        allowDecimal
                        decimalSeparator=","
                        required
                        withAsterisk
                    />
                    <Select
                        label={t("fields.cicle.label")}
                        id="cicle"
                        name="cicle"
                        placeholder={t("fields.cicle.placeholder")}
                        data={[
                            { label: "Mensal", value: PlanType.MONTHLY },
                            { label: "Bimestral", value: PlanType.BI_MONTHLY },
                            { label: "Trimestral", value: PlanType.QUARTERLY },
                            { label: "Semanal", value: PlanType.SEMMONTLY },
                            { label: "Semestral", value: PlanType.BI_ANNUAL },
                            { label: "Anual", value: PlanType.ANNUAL },

                        ]}
                        value={PlanType.MONTHLY}
                        classNames={{
                            dropdown: "!z-[1000]"
                        }}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        required
                        withAsterisk
                    />
                    <Select
                        label={t("fields.contractModel.label")}
                        id="contractModel"
                        name="contractModel"
                        placeholder={t("fields.contractModel.placeholder")}
                        required
                        withAsterisk
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                    />

                </div>
                <Button
                    type="submit"
                    color="#7439FA"
                    radius={"lg"}
                    size="lg"
                    fullWidth={false}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >{g("forms.submit")}</Button>
            </form>
        </Modal>

    )
}