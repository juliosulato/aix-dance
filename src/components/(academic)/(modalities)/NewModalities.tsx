"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { authedFetch } from "@/utils/authedFetch";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { Modality } from "@/types/class.types";
import { CreateModalityInput, createModalitySchema } from "@/schemas/academic/modality";
import { getErrorMessage } from "@/utils/getErrorMessage";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Modality[]>;
};

export default function NewModalities({ opened, onClose, mutate }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    // Usamos o schema estático

    const { handleSubmit, formState: { errors }, register, reset } = useForm<CreateModalityInput>({
        resolver: zodResolver(createModalitySchema) as any,
    });

    const { data: sessionData } = useSession();

    async function createModality(data: CreateModalityInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/modalities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (responseData.code) {
                notifications.show({
                    message: "Ocorreu um problema ao criar a modalidade.",
                    color: "yellow"
                });
            }

            if (!response.ok) throw new Error("Failed to create modality");

            notifications.show({
                message: "Modalidade criada com sucesso.",
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error: unknown) {
            console.error(error);

            if ((error as any)?.code == "MODALITY_ALREADY_EXISTS") {
                notifications.show({
                    message: "Já existe uma modalidade com esse nome.",
                    color: "yellow"
                });
            } else {
                notifications.show({
                    message: getErrorMessage(error, "Erro ao criar modalidade."),
                    color: "red"
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = () => {
        notifications.show({
            message: "Erro de validação",
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={"Nova Modalidade"}
            size="lg"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createModality, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                <TextInput
                    label={"Nome da Modalidade"}
                    placeholder={"Ex: Ballet, Jazz, Ritmos"}
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
                    Salvar
                </Button>
            </form>
        </Modal>
    );
}

