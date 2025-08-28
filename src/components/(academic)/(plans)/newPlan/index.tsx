"use client";

import { CreatePlanInput, createPlanSchema } from "@/schemas/plans.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PlanType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useState } from "react";

type Props = {
    opened: boolean;
    onClose: () => void;
};

export default function NewPlan({ opened, onClose }: Props) {
    const t = useTranslations("plans.modals.create");
    const g = useTranslations("");
    const [visible, setVisible] = useState(false);

    const { control, handleSubmit, formState: { errors }, register, setValue, watch } = useForm<CreatePlanInput>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            name: '',
            frequency: 1,
            type: PlanType.MONTHLY,
            amount: 0,
            contractModelId: '',
            monthlyInterest: 0,
            finePercentage: 0,
            discountPercentage: 0,
            maximumDiscountPeriod: 0,
            maximumPaymentTerm: 0,
        },
    });

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para criar estudantes.</div>;

    async function createPlan(data: CreatePlanInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setVisible(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/plans`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) throw new Error("Erro ao criar plano");
            notifications.show({ message: "Plano criado com sucesso!" });
            onClose();
        } catch (err) {
            notifications.show({ color: "red", message: "Erro inesperado ao criar plano" });
        } finally {
            setVisible(false);
        }
    }

    const onError = (errors: any) => console.log("Erros de validação:", errors);

    const watchType = watch("type");

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("title")}
            size="auto"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createPlan, onError)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw]">
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("subtitle")}</h2>

                    <TextInput
                        label={t("fields.name.label")}
                        placeholder={t("fields.name.placeholder")}
                        {...register("name")}
                        error={errors.name?.message}
                        required
                        withAsterisk
                    />

                    <Controller
                        name="frequency"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                label={t("fields.frequency.label")}
                                placeholder={t("fields.frequency.placeholder")}
                                min={1}
                                allowDecimal={false}
                                suffix={t("fields.frequency.suffix")}
                                required
                                withAsterisk
                                value={field.value}
                                onChange={(val) => field.onChange(val ?? 1)}
                            />
                        )}
                    />

                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                label={t("fields.amount.label")}
                                allowDecimal
                                decimalSeparator=","
                                required
                                withAsterisk
                                value={field.value}
                                onChange={(val) => field.onChange(val ?? 0)}
                                leftSection={<RiMoneyDollarCircleFill />}
                            />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label={t("fields.cicle.label")}
                                placeholder={t("fields.cicle.placeholder")}
                                required
                                withAsterisk
                                data={[
                                    { label: "Mensal", value: PlanType.MONTHLY },
                                    { label: "Bimestral", value: PlanType.BI_MONTHLY },
                                    { label: "Trimestral", value: PlanType.QUARTERLY },
                                    { label: "Semanal", value: PlanType.SEMMONTLY },
                                    { label: "Semestral", value: PlanType.BI_ANNUAL },
                                    { label: "Anual", value: PlanType.ANNUAL },
                                ]}
                                classNames={{ dropdown: "!z-[1000]" }}
                                className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
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
                    radius="lg"
                    size="lg"
                    fullWidth={false}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >
                    {g("forms.submit")}
                </Button>
            </form>
        </Modal>
    );
}
