"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { UpdateSupplierInput, getUpdateSupplierSchema } from "@/schemas/supplier.schema";
import Address from "@/components/AddressForm";
import { SupplierFromApi } from "./SupplierFromApi";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<SupplierFromApi[]>;
    supplier: SupplierFromApi;
};

export default function UpdateSupplier({ opened, onClose, mutate, supplier }: Props) {
    const t = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);
    const updateSupplier = getUpdateSupplierSchema((key: string) => t(key as any));

    const { handleSubmit, formState: { errors }, register, reset } = useForm<UpdateSupplierInput>({
        resolver: zodResolver(updateSupplier),
        defaultValues: {
            name: supplier.name,
            cellPhoneNumber: supplier.cellPhoneNumber ?? undefined,
            phoneNumber: supplier.phoneNumber ?? undefined,
            corporateReason: supplier.corporateReason ?? undefined,
            document: supplier.document ?? undefined,
            documentType: supplier.documentType ?? undefined,
            address: {
                city: supplier.address.city ?? undefined,   
                publicPlace: supplier.address.publicPlace ?? undefined,   
                complement: supplier.address.complement ?? undefined,   
                neighborhood: supplier.address.neighborhood ?? undefined,   
                number: supplier.address.number ?? undefined,   
                zipCode: supplier.address.zipCode ?? undefined,   
                state: supplier.address.state ?? undefined,   
            },
        }
    });


    const handleClose = () => {
        onClose();
        reset();
    }

    const { data: sessionData } = useSession();

    async function handleUpdateSupplier(data: UpdateSupplierInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: t("errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/suppliers/${supplier.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create supplier");

            notifications.show({
                message: t("suppliers.update.notifications.success"),
                color: "green"
            });

            reset();
            mutate();
            handleClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message: t("suppliers.update.notifications.error"),
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = () => {
        notifications.show({
            title: t("general.errors.validationTitle"),
            message: t("general.errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t("suppliers.update.title")}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(handleUpdateSupplier, handleFormErrors)} className="flex flex-col gap-4">
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("suppliers.basicInformations")}</h2>

                    <TextInput
                        {...register("name")}
                        label={t("suppliers.fields.name.label")}
                        placeholder={t("suppliers.fields.name.placeholder")}
                        error={errors?.name?.message}
                        required
                    />
                    <TextInput
                        {...register("corporateReason")}
                        label={t("suppliers.fields.corporateReason.label")}
                        placeholder={t("suppliers.fields.corporateReason.placeholder")}
                        error={errors?.corporateReason?.message}
                    />
                    <TextInput
                        {...register("documentType")}
                        label={t("suppliers.fields.documentType.label")}
                        placeholder={t("suppliers.fields.documentType.placeholder")}
                        error={errors?.documentType?.message}
                    />
                    <TextInput
                        {...register("document")}
                        label={t("suppliers.fields.document.label")}
                        placeholder={t("suppliers.fields.document.placeholder")}
                        error={errors?.document?.message}
                    />

                    <TextInput
                        {...register("email")}
                        label={t("forms.general-fields.email.label")}
                        error={errors?.email?.message}
                    />

                    <TextInput
                        {...register("cellPhoneNumber")}
                        label={t("forms.general-fields.cellPhoneNumber.label")}
                        error={errors?.cellPhoneNumber?.message}
                    />
                    <TextInput
                        {...register("phoneNumber")}
                        label={t("forms.general-fields.phoneNumber.label")}
                        error={errors?.phoneNumber?.message}
                    />
                </div>
                <Address errors={errors} register={register} />
                <Button
                    type="submit"
                    color="#7439FA"
                    radius="lg"
                    size="lg"
                    loading={isLoading}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >
                    {t("forms.submit")}
                </Button>
            </form>
            <LoadingOverlay visible={isLoading} />
        </Modal>
    );
}

