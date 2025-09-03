"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { CreateCategoryBillInput, getCreateCategoryBillSchema } from "@/schemas/financial/category-bill.schema";
import NewCategoryBill__BasicInformations from "./basic-informations";

type Props = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function NewCategoryBill({ opened, onClose, onSuccess }: Props) {
    const t = useTranslations("financial.categoryBills.modals.create");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createCategoryBillSchema = getCreateCategoryBillSchema((key: string) => t(key as any));

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<CreateCategoryBillInput>({
        resolver: zodResolver(createCategoryBillSchema),
    });

    const { data: sessionData } = useSession();

    async function createCategoryBill(data: CreateCategoryBillInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("general.errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/category-bills`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create category bill");

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
            title={t("title")}
            size="lg"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createCategoryBill, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                {sessionData?.user.tenancyId && (
                     <NewCategoryBill__BasicInformations
                        control={control} 
                        errors={errors} 
                        register={register}
                        tenancyId={sessionData.user.tenancyId}
                    />
                )}
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

