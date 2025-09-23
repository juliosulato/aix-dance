"use client"

import { Button, LoadingOverlay, Modal, PasswordInput, TextInput } from "@mantine/core";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateUserSchema, UpdateUserInput } from "@/schemas/user.schema";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { Address as AddressType, CommissionTier, Teacher, User } from "@prisma/client";

export interface TeacherFromApi extends User {
    teacher: (Teacher & {
        comissionTiers: CommissionTier[];
        address: AddressType | null;
        document: string | null;
        cellPhoneNumber: string;
    }) | null;
}

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<TeacherFromApi[]>;
    user: TeacherFromApi | null;
}


function UpdateTeacherAccessData({ opened, onClose, user, mutate }: Props) {
    const [visible, setVisible] = useState(true);

    // Usamos o schema estático

    const { control, handleSubmit, formState: { errors }, register, reset, trigger } = useForm<UpdateUserInput>({
        resolver: zodResolver(updateUserSchema) as any,
        mode: 'all',
        defaultValues: { 
            email: user?.email || "",
        }
    });

    useEffect(() => {
        if (user) {
            reset({ });
            setVisible(false);
        }
    }, [user, reset])


    const { data: sessionData, status } = useSession();
    if (status === "loading" && !user) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para editar professores.</div>;

    async function updateTeacher(data: UpdateUserInput) {
        if (!sessionData?.user.tenancyId || !user?.id) {
            notifications.show({ color: "red", message: "Sessão ou dados do professor inválidos." });
            return;
        }

        setVisible(true);
        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({ ...data }),
                headers: { "Content-Type": "application/json" },
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                console.error("Erro do backend:", errorData);
                throw new Error("Erro ao atualizar professor");
            }

            notifications.show({ message: "Senha atualizada com sucesso!", color: "green" });
            mutate(); // Revalida os dados da lista
            onClose();
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: "Erro inesperado ao atualizar professor" });
        } finally {
            setVisible(false);
        }
    }

    return (
        <>
            <Modal opened={opened} onClose={onClose} title={"Texto"} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(updateTeacher)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
                        <h2 className="text-lg font-bold md:col-span-2">{"Texto"}</h2>
                        <TextInput
                            prefix="@"
                            label={"E-mail de acesso"}
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
                        <p className="text-neutral-400 underline">{"Texto"}</p>
                    </div>
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius={"lg"}
                        size="lg"
                        fullWidth={false}
                        className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
                    >{"Salvar"}</Button>

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
export default UpdateTeacherAccessData;
