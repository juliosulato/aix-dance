"use client";

import { Button, LoadingOverlay, Modal, PasswordInput, TextInput, Select } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';

import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import AvatarUpload from "@/components/avatarUpload";
import { KeyedMutator } from "swr";
import { UserFromApi } from "./UserFromApi";
import { getUpdateUserSchema, UpdateUserInput } from "@/schemas/user.schema";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<UserFromApi[]>;
    user: UserFromApi;
    tenancyId: string
};

function UpdateUser({ opened, onClose, mutate, user, tenancyId }: Props) {
    const t = useTranslations("");
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(user?.image || null);

    const updateUserSchema = getUpdateUserSchema(t);

    const { control, handleSubmit, formState: { errors }, register, reset, setValue } = useForm<UpdateUserInput>({
        resolver: zodResolver(updateUserSchema) as any,
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            role: user?.role || "STAFF",
            prevPassword: "",
            password: "",
            confirmPassword: "",
        },
        mode: 'all',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const locale = useLocale();
    dayjs.locale(locale);

    async function updateUser(data: UpdateUserInput) {
        setVisible(true);

        if (data.prevPassword === "" && (data.password !== "" || data.confirmPassword !== "")) {
            notifications.show({ color: "red", message: t("settings.users.modals.update.notifications.prevPassword") });
            setVisible(false);
            return;
        }

        if (data.password === "" && data.confirmPassword !== "") {
            notifications.show({ color: "red", message: t("settings.users.modals.update.notifications.password") });
            setVisible(false);
            return;
        }

        if (data.password !== "" && data.confirmPassword === "") {
            notifications.show({ color: "red", message: t("settings.users.modals.update.notifications.confirmPassword") });
            setVisible(false);
            return;
        }

        if (data.password !== data.confirmPassword) {
            notifications.show({ color: "red", message: t("settings.users.modals.update.notifications.passwordsMismatch") });
            setVisible(false);
            return;
        }

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...data,
                    image: avatar,
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) {
                const error = await resp.json();
                if (error?.code === "INVALID_PASSWORD") {
                    notifications.show({ color: "red", message: t("settings.users.errors.INVALID_PASSWORD") });
                } else {
                    throw new Error("Erro ao atualizar usuário");
                }
                return;
            }

            notifications.show({ message: t("settings.users.modals.update.notifications.success"), color: "green" });
            handleClose();
            mutate();
        } catch (err: any) {
            notifications.show({ color: "red", message: t("settings.users.modals.update.notifications.error") });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={handleClose}
                title={t("settings.users.modals.update.title")}
                size="xl"
                radius="lg"
                centered
                classNames={{
                    title: "!font-semibold",
                    header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300"
                }}
            >
                <form onSubmit={handleSubmit(updateUser)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <div className="flex flex-col gap-4">
                        <AvatarUpload defaultUrl={avatar} onUploadComplete={setAvatar} />

                        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextInput
                                label={t("forms.general-fields.firstName.label")}
                                placeholder={t("forms.general-fields.firstName.placeholder")}
                                required
                                {...register("firstName")}
                                error={errors.firstName?.message}
                            />
                            <TextInput
                                label={t("forms.general-fields.lastName.label")}
                                placeholder={t("forms.general-fields.lastName.placeholder")}
                                required
                                {...register("lastName")}
                                error={errors.lastName?.message}
                            />
                            <TextInput
                                label={t("forms.general-fields.email.label")}
                                placeholder={t("forms.general-fields.email.placeholder")}
                                required
                                className="md:col-span-2"
                                {...register("email")}
                                error={errors.email?.message}
                            />

                            <Controller
                                control={control}
                                name="role"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label={t("settings.users.role.label")}
                                        data={[
                                            { value: "ADMIN", label: t("settings.users.role.admin") },
                                            { value: "STAFF", label: t("settings.users.role.staff") },
                                        ]}
                                        required
                                    />
                                )}
                            />
                        </div>

                        {/* Seção de atualização de senha */}
                        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Controller
                                control={control}
                                name="prevPassword"
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        label={t("settings.users.modals.update.accessData.fields.prevPassword.label")}
                                        error={errors.prevPassword?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        label={t("settings.users.modals.update.accessData.fields.password.label")}
                                        error={errors.password?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        label={t("settings.users.modals.update.accessData.fields.confirmPassword.label")}
                                        error={errors.confirmPassword?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        fullWidth={false}
                        className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
                    >
                        {t("forms.save")}
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

export default UpdateUser;
