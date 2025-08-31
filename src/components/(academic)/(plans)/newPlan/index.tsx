"use client";

import { CreatePlanInput, createPlanSchema } from "@/schemas/plans.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useState } from "react";
import BasicInformations from "./basicInformations";
import NewPlan__Fees from "./fees";

type Props = {
    opened: boolean;
    onClose: () => void;
};

export default function NewPlan({ opened, onClose }: Props) {
    const t = useTranslations("plans.modals.create");
    const g = useTranslations("");
    const [visible, setVisible] = useState(false);

    const { control, handleSubmit, formState: { errors }, register, watch } = useForm<CreatePlanInput>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            monthlyInterest: 0,
            discountPercentage: 0,
            fineGracePeriod: 0,
            finePercentage: 0,
            interestGracePeriod: 0,
            maximumDiscountPeriod: 0,
            amount: 0.00
        }
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
            notifications.show({ message: "Plano criado com sucesso!", color: "green" });
            onClose();
        } catch (err) {
            notifications.show({ color: "red", message: "Erro inesperado ao criar plano" });
        } finally {
            setVisible(false);
        }
    }

    const onError = (errors: any) => console.log("Erros de validação:", errors);

    const amount = watch("amount");

    return (
        <>
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
                <BasicInformations control={control} errors={errors} register={register} tenancyId={sessionData.user.tenancyId} />
                <NewPlan__Fees amount={amount} control={control} errors={errors} register={register} />
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
        </>
    );
}
