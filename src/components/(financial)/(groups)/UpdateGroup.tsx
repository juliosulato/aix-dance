"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import { authedFetch } from "@/utils/authedFetch";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { UpdateCategoryGroupInput, updateCategoryGroupSchema } from "@/schemas/financial/category-group.schema";
import { KeyedMutator } from "swr";
import { CategoryGroup } from "@/types/bill.types";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: () => void | KeyedMutator<CategoryGroup[]>;
    categoryGroups: CategoryGroup | null;
};

export default function UpdateCategoryGroup({ opened, onClose, categoryGroups, mutate }: Props) {

    const [isLoading, setIsLoading] = useState(false);

    // Usamos o schema estático

    const { handleSubmit, formState: { errors }, register, reset } = useForm<UpdateCategoryGroupInput>({
        resolver: zodResolver(updateCategoryGroupSchema),
        defaultValues: { name: "" }
    });

    useEffect(() => {
        if (categoryGroups) {
            reset({
                name: categoryGroups.name,
            });
        }
    }, [categoryGroups, reset]);

    const { data: sessionData } = useSession();

    async function updateCategoryGroup(data: UpdateCategoryGroupInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/category-groups/${categoryGroups?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create category group");

            notifications.show({
                message: "Grupo atualizado com sucesso.",
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Erro",
                message: "Erro inesperado",
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = () => {
        notifications.show({
            title: "Erro de validação",
            message: "Verifique os dados informados",
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Editar Grupo"
            size="md"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(updateCategoryGroup, handleFormErrors)} className="flex flex-col gap-4">
                <LoadingOverlay visible={isLoading} />
                <TextInput
                    label={"Nome"}
                    placeholder={"Digite Aqui"}
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
                    Salvar
                </Button>
            </form>
        </Modal>
    );
}

