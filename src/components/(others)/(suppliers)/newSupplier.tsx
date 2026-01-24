"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { CreateSupplierInput, createSupplierSchema } from "@/schemas/supplier.schema";
import Address from "@/components/AddressForm";
import { SupplierFromApi } from "./SupplierFromApi";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<SupplierFromApi[]>;
};

export default function NewSupplier({ opened, onClose, mutate }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    // Usamos o schema estático

    const { handleSubmit, formState: { errors }, register, reset } = useForm<CreateSupplierInput>({
        resolver: zodResolver(createSupplierSchema)
    });


    const handleClose = () => {
        onClose();
        reset();
    };

    const { data: sessionData, isPending } = useSession();

    async function handleCreateSupplier(data: CreateSupplierInput) {
        if (!sessionData?.user.tenantId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${sessionData.user.tenantId}/suppliers`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create supplier");

            notifications.show({
                message: "Fornecedor criado com sucesso.",
                color: "green"
            });

            reset();
            mutate();
            handleClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message: "Falha ao criar fornecedor.",
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = () => {
        notifications.show({
            title: "Erro de validação",
            message: "Por favor verifique os campos do formulário.",
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={"Novo Fornecedor"}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(handleCreateSupplier, handleFormErrors)} className="flex flex-col gap-4">
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Informações do Fornecedor"}</h2>

                    <TextInput
                        {...register("name")}
                        label={"Nome"}
                        placeholder={"Nome do fornecedor"}
                        error={errors?.name?.message}
                        required
                    />
                    <TextInput
                        {...register("corporateReason")}
                        label={"Razão Social"}
                        placeholder={"Razão social (se aplicável)"}
                        error={errors?.corporateReason?.message}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-3 lg:cols-span-4 3xl:col-span-5">
                        <TextInput
                            {...register("documentType")}
                            label={"Tipo de Documento"}
                            placeholder={"CPF/CNPJ"}
                            error={errors?.documentType?.message}
                        />
                        <TextInput
                            {...register("document")}
                            label={"Documento"}
                            error={errors?.document?.message}
                        />
                    </div>

                    <TextInput
                        {...register("email")}
                        label={"E-mail"}
                        error={errors?.email?.message}
                    />

                    <TextInput
                        {...register("cellPhoneNumber")}
                        label={"Celular"}
                        error={errors?.cellPhoneNumber?.message}
                    />
                    <TextInput
                        {...register("phoneNumber")}
                        label={"Telefone"}
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
                    className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
                >
                    {"Salvar"}
                </Button>
            </form>
            <LoadingOverlay visible={isLoading} />
        </Modal>
    );
}

