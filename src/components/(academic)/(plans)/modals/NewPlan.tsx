"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import BasicInformations from "./basicInformations";
import NewPlan__Fees from "./fees";
import { KeyedMutator } from "swr";
import { Plan } from "@prisma/client";
import { createPlanSchema, CreatePlanInput } from "@/schemas/academic/plan";
import { authedFetch } from "@/utils/authedFetch";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Plan[]>;
};

export default function NewPlan({ opened, onClose, mutate }: Props) {

    
    const [visible, setVisible] = useState(false);

    // Usamos o schema estático

    const { control, handleSubmit, formState: { errors }, register, watch, reset } = useForm<CreatePlanInput>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            monthlyInterest: 0,
            discountPercentage: 0,
            fineGracePeriod: 0,
            finePercentage: 0,
            interestGracePeriod: 0,
            maximumDiscountPeriod: 0,
            amount: 0.00,
            frequency: 1,
            type: "MONTHLY",
        }
    });

    const amount = watch("amount");

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;

    async function createPlan(data: CreatePlanInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        if (data.amount === 0) {
            notifications.show({ color: "yellow", message: "O valor do plano deve ser maior que zero."});
            return;
        }

        setVisible(true);
        try {
            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/plans`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to update plan.");

            notifications.show({
                message: "Plano criado com sucesso!",
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message:"Erro interno. Tente novamente.",
                color: "red"
            });
        } finally {
            setVisible(false);
        }
    }

    const onError = (errors: any) => console.log("Erros de validação:", errors);

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={"Novo Plano"}
                size="auto"
                radius="lg"
                centered
                classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
            >
                <form onSubmit={handleSubmit(createPlan, onError)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw]">
                    <BasicInformations control={control as any} errors={errors} register={register as any} tenancyId={sessionData.user.tenancyId} />
                    <NewPlan__Fees amount={Number(amount)} control={control as any} errors={errors} register={register as any} />
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        fullWidth={false}
                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                    >
                       Salvar
                    </Button>
                </form>
            </Modal>
            <LoadingOverlay
                visible={visible}
                zIndex={9999}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'violet', type: 'dots' }}
                pos="fixed"
                h="100vh"
                w="100vw"
            />
        </>
    );
}
