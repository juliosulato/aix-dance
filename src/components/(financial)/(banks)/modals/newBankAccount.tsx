"use client";

import { useState } from "react";
import { Control, FieldError, FieldErrors, useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";

import { CreateBankInput, getCreateBankSchema, UpdateBankInput } from "@/schemas/financial/bank.schema";
import NewBank__BasicInformations from "./basic-informations";
import { KeyedMutator } from "swr";
import { Bank } from "@prisma/client";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: () => void | KeyedMutator<Bank[]>;
};

export default function NewBankAccount({ opened, onClose }: Props) {
    const t = useTranslations("financial.banks");
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
            maintenanceFeeDue: undefined,
        }
    });

    const { data: sessionData, status } = useSession();

    if (status === "loading") {
        return <LoadingOverlay visible />;
    }

    async function createBank(data: CreateBankInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("general.errors.invalidSession") });
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
                message: t("modals.create.notifications.success"),
                color: "green"
            });

            reset();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: g("general.errors.title"),
                message: g("general.errors.unexpected"),
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (errors: any) => {
        console.warn("Validation errors:", errors);
        notifications.show({
            title: g("general.errors.validationTitle"),
            message: g("general.errors.validationMessage"),
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
                    <NewBank__BasicInformations control={control as Control<UpdateBankInput>} errors={errors as FieldErrors<UpdateBankInput>} register={register as UseFormRegister<UpdateBankInput>} />
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

