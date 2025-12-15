"use client";

import { updatePlanSchema, UpdatePlanInput } from "@/schemas/academic/plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import BasicInformations from "./basicInformations";
import NewPlan__Fees from "./fees";
import { KeyedMutator } from "swr";
import { Plan } from "@prisma/client";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Plan[]>;
    plan: Plan | null;
};

export default function UpdatePlan({ opened, onClose, mutate, plan }: Props) {


    const [isLoading, setIsLoading] = useState(false);

    // Usamos o schema estático

    const { control, handleSubmit, formState: { errors }, register, watch, reset } = useForm<UpdatePlanInput>({
        resolver: zodResolver(updatePlanSchema),
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

    useEffect(() => {
        if (plan) {
            reset({
                ...plan,
                amount: Number(plan.amount) ?? undefined,
            })
        }
    }, [plan, reset])

    const amount = watch("amount");

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;

    async function createPlan(data: UpdatePlanInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }
        setIsLoading(true);

        if (data.amount === 0) {
            notifications.show({ color: "yellow", message: "O valor do plano deve ser maior que zero." });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/plans/${plan?.id}`, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });


            if (!response.ok) throw new Error("Failed to update plan.");

            notifications.show({
                message: "Plano atualizado com sucesso.",
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message: "Erro ao atualizar o plano.",
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const onError = (errors: any) => console.log("Erros de validação:", errors);



    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={"Atualizar Plano"}
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
            <LoadingOverlay visible={isLoading}
                zIndex={9999}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'violet', type: 'dots' }}
                pos="fixed"
                h="100vh"
                w="100vw"
            />
        </>
    );
};