"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { Modality } from "@prisma/client";
import { CreateModalityInput, getCreateModality } from "@/schemas/academic/modality";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Modality[]>;
};

export default function NewModalities({ opened, onClose, mutate }: Props) {
    const t = useTranslations("academic.modalities.modals");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createModalitySchema = getCreateModality((key: string) => t(key as any));

    const { handleSubmit, formState: { errors }, register, reset } = useForm<CreateModalityInput>({
        resolver: zodResolver(createModalitySchema) as any,
    });

    const { data: sessionData } = useSession();

    async function createModality(data: CreateModalityInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("general.errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/modalities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json()

            if (responseData.code) {
                notifications.show({
                    message: t("errors.MODALITY_ALREADY_EXISTS"),
                    color: "yellow"
                });
            }

            if (!response.ok) throw new Error("Failed to create modality");

            notifications.show({
                message: t("create.notifications.success"),
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error: any) {
            console.error(error);

            if (error?.code == "MODALITY_ALREADY_EXISTS") {
                notifications.show({
                    message: t("errors.MODALITY_ALREADY_EXISTS"),
                    color: "yellow"
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = () => {
        notifications.show({
            title: g("general.errors.validationTitle"),
            message: g("general.errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("create.title")}
            size="lg"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createModality, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                <TextInput
                    label={t("fields.name.label")}
                    placeholder={t("fields.name.placeholder")}
                    {...register("name")}
                    error={errors.name?.message}
                    required
                    withAsterisk
                    className="md:col-span-2"
                />
                <Button
                    type="submit"
                    color="#7439FA"
                    radius="lg"
                    size="md"
                    loading={isLoading}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >
                    {g("forms.submit")}
                </Button>
            </form>
        </Modal>
    );
}

