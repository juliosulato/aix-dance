"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { CreateCategoryGroupInput, getCreateCategoryGroupSchema } from "@/schemas/financial/category-group.schema";
import { KeyedMutator } from "swr";
import { CategoryGroup } from "@prisma/client";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<CategoryGroup[]>;
};

export default function NewCategoryGroup({ opened, onClose, mutate }: Props) {
    const t = useTranslations("financial.category-groups");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createCategoryGroupSchema = getCreateCategoryGroupSchema((key: string) => t(key as any));

    const { handleSubmit, formState: { errors }, register, reset } = useForm<CreateCategoryGroupInput>({
        resolver: zodResolver(createCategoryGroupSchema),
        defaultValues: { name: "" }
    });

    const { data: sessionData } = useSession();

    async function createCategoryGroup(data: CreateCategoryGroupInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/category-groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create category group");

            notifications.show({
                message: t("modals.create.notifications.success"),
                color: "green"
            });
            reset();
            mutate();
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
            title={t("modals.create.title")}
            size="md"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createCategoryGroup, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                <TextInput
                    label={t("modals.fields.name.label")}
                    placeholder={t("modals.fields.name.placeholder")}
                    {...register("name")}
                    error={errors.name?.message}
                    required
                    withAsterisk
                />
                <Button
                    type="submit"
                    color="#7439FA"
                    radius="lg"
                    size="lg"
                    loading={isLoading}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >
                    {g("forms.submit")}
                </Button>
            </form>
        </Modal>
    );
}

