"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";

import { CreateBankInput, getCreateBankSchema } from "@/schemas/financial/bank.schema";
import NewBank__BasicInformations from "./basic-informations";

type Props = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para recarregar os dados na página principal
};

export default function NewBank({ opened, onClose, onSuccess }: Props) {
    const t = useTranslations("financial.banks.modals.create");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createBankSchema = getCreateBankSchema((key: string) => t(key as any));

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<CreateBankInput>({
        resolver: zodResolver(createBankSchema) as any,
        defaultValues: {
            name: "",
            account: "",
            agency: "",
            code: "",
            description: "",
            maintenanceFeeAmount: undefined,
            maintenanceFeeDue: null,
        }
    });

    const { data: sessionData, status } = useSession();

    if (status === "loading") {
        return <LoadingOverlay visible />;
    }

    async function createBank(data: CreateBankInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/banks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create bank");
            }

            notifications.show({
                title: t("notifications.success.title"),
                message: t("notifications.success.message"),
                color: "green"
            });

            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: g("errors.title"),
                message: g("errors.unexpected"),
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (errors: any) => {
        console.warn("Validation errors:", errors);
        notifications.show({
            title: g("errors.validationTitle"),
            message: g("errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={t("title")}
                size="lg"
                radius="lg"
                centered
                classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
            >
                <form onSubmit={handleSubmit(createBank, handleFormErrors)} className="flex flex-col gap-4">
                    <NewBank__BasicInformations control={control} errors={errors} register={register} />
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                        loading={isLoading}
                    >
                        {g("forms.submit")}
                    </Button>
                </form>
            </Modal>
            <LoadingOverlay visible={isLoading} />
        </>
    );
}

