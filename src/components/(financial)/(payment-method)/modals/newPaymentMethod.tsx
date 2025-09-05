"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { CreatePaymentMethodInput, getCreatePaymentMethodSchema } from "@/schemas/financial/payment-method.schema";
import PaymentMethod__BasicInformations from "./basic-informations";
import PaymentMethod__Fees from "./feeForm";
import { KeyedMutator } from "swr";
import { PaymentMethod } from "..";

type Props = { opened: boolean; onClose: () => void; onSuccess?: () => void;
  mutate: () => void | KeyedMutator<PaymentMethod[]>;
 };

export default function NewPaymentMethod({ opened, onClose, onSuccess, mutate }: Props) {
    const t = useTranslations("financial.paymentMethods.modals");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createPaymentMethodSchema = getCreatePaymentMethodSchema((key: string) => t(key as any));

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<CreatePaymentMethodInput>({
        resolver: zodResolver(createPaymentMethodSchema) as any,
        defaultValues: { name: "", operator: "", fees: [] }
    });

    const { data: sessionData } = useSession();

    async function createPaymentMethod(data: CreatePaymentMethodInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("errors.invalidSession") });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/payment-methods`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to create payment method");
            notifications.show({ message: t("content.notifications.success"), color: "green" });
            reset();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({ message: t("content.notifications.error"), color: "red" });
        } finally {
            setIsLoading(false);
            mutate();
        }
    }

    const handleFormErrors = (err: any) => {
        console.warn("Validation errors:", err)
        notifications.show({
            title: g("errors.validationTitle"),
            message: g("errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title={t("create.title")} size="xl" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}>
            <form onSubmit={handleSubmit(createPaymentMethod, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                <PaymentMethod__BasicInformations register={register as any} errors={errors} />
                <PaymentMethod__Fees control={control as any} register={register as any} errors={errors} />
                <Button type="submit" color="#7439FA" radius="lg" size="md" loading={isLoading} className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto">
                    {g("forms.submit")}
                </Button>
            </form>
        </Modal>
    );
}

