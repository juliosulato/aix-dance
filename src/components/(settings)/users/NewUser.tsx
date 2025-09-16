"use client"

import { Button, LoadingOverlay, Modal, PasswordInput, TextInput, MultiSelect, Select } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';

import { CreateUserInput, getCreateUserSchema } from "@/schemas/user.schema";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import AvatarUpload from "@/components/avatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { UserFromApi } from "./UserFromApi";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<UserFromApi[]>;
}


function NewUser({ opened, onClose, mutate }: Props) {
    const t = useTranslations("");
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);

    const createUserSchema = getCreateUserSchema(t);

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema) as any,
        defaultValues: {
            teacher: undefined,
            role: "STAFF"
        },
        mode: 'all',
    });


    const handleClose = () => {
        reset();
        onClose();
    }

    const locale = useLocale();
    dayjs.locale(locale);

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>{t("notifications.error")}</div>;

    async function createUser(data: CreateUserInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: t("settings.users.create.notifications.error") });
            return;
        }

        setVisible(true);

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users`, {
                method: "POST",
                body: JSON.stringify({
                    ...data,
                    image: avatar,
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) {
                const data = await resp.json();
                if (data?.code == "USER_EXISTS") {
                    notifications.show({
                        message: t("settings.users.errors.USER_EXISTS"),
                        color: "yellow"
                    });
                    return;
                } else {
                    throw new Error("Erro ao criar usuário");
                }
            }

            notifications.show({ message: t("settings.users.create.notifications.success"), color: "green" });
            handleClose();
            mutate();
        } catch (err: any) {
            notifications.show({ color: "red", message: t("settings.users.create.notifications.error") });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={handleClose}
                title={t("title")}
                size="xl"
                radius="lg"
                centered
                classNames={{
                    title: "!font-semibold",
                    header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300"
                }}
            >
                <form onSubmit={handleSubmit(createUser)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <div className="flex flex-col gap-4">
                        <AvatarUpload onUploadComplete={setAvatar} />

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
                                name="password"
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        required
                                        label={t("settings.users.modals.create.accessData.fields.password.label")}
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
                                        required
                                        label={t("settings.users.modals.create.accessData.fields.confirmPassword.label")}
                                        error={errors.confirmPassword?.message}
                                    />
                                )}
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
                    </div>

                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        fullWidth={false}
                        className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
                    >
                        {t("forms.submit")}
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
    )
}

export default NewUser;
