"use client";

import { Button, LoadingOverlay, Modal, PasswordInput, TextInput, Select } from "@mantine/core";
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
import { updateUserSchema, UpdateUserInput } from "@/schemas/user.schema";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<UserFromApi[]>;
    user: UserFromApi;
    tenancyId: string
};

function UpdateUser({ opened, onClose, mutate, user, tenancyId }: Props) {
    const [visible, setVisible] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(user?.image || null);

    // Usamos o schema estático

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


    async function updateUser(data: UpdateUserInput) {
        setVisible(true);

        if (data.prevPassword === "" && (data.password !== "" || data.confirmPassword !== "")) {
            notifications.show({ color: "red", message: "Texto" });
            setVisible(false);
            return;
        }

        if (data.password === "" && data.confirmPassword !== "") {
            notifications.show({ color: "red", message: "Texto" });
            setVisible(false);
            return;
        }

        if (data.password !== "" && data.confirmPassword === "") {
            notifications.show({ color: "red", message: "Texto" });
            setVisible(false);
            return;
        }

        if (data.password !== data.confirmPassword) {
            notifications.show({ color: "red", message: "Texto" });
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
                    notifications.show({ color: "red", message: "Texto" });
                } else {
                    throw new Error("Erro ao atualizar usuário");
                }
                return;
            }

            notifications.show({ message: "Texto", color: "green" });
            handleClose();
            mutate();
        } catch (err: any) {
            notifications.show({ color: "red", message: "Texto" });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={handleClose}
                title={"Texto"}
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
                                label={"Primeiro Nome"}
                                placeholder={"Texto"}
                                required
                                {...register("firstName")}
                                error={errors.firstName?.message}
                            />
                            <TextInput
                                label={"Sobrenome"}
                                placeholder={"Texto"}
                                required
                                {...register("lastName")}
                                error={errors.lastName?.message}
                            />
                            <TextInput
                                label={"E-mail"}
                                placeholder={"Texto"}
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
                                        label={"Texto"}
                                        data={[
                                            { value: "ADMIN", label: "Texto" },
                                            { value: "STAFF", label: "Texto" },
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
                                        label={"Texto"}
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
                                        label={"Texto"}
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
                                        label={"Texto"}
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
                        {"Texto"}
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
