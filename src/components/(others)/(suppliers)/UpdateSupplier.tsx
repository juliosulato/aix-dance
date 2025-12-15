"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { UpdateSupplierInput, updateSupplierSchema } from "@/schemas/supplier.schema";
import Address from "@/components/AddressForm";
import { SupplierFromApi } from "./SupplierFromApi";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<SupplierFromApi[]>;
    supplier: SupplierFromApi;
};

export default function UpdateSupplier({ opened, onClose, mutate, supplier }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    // Usamos o schema estático

    const { handleSubmit, formState: { errors }, register, reset } = useForm<UpdateSupplierInput>({
        resolver: zodResolver(updateSupplierSchema),
        defaultValues: {
            name: supplier.name,
            cellPhoneNumber: supplier.cellPhoneNumber ?? undefined,
            phoneNumber: supplier.phoneNumber ?? undefined,
            corporateReason: supplier.corporateReason ?? undefined,
            document: supplier.document ?? undefined,
            documentType: supplier.documentType ?? undefined,
            address: {
                city: supplier?.address?.city ?? undefined,
                publicPlace: supplier?.address?.publicPlace ?? undefined,
                complement: supplier?.address?.complement ?? undefined,
                neighborhood: supplier?.address?.neighborhood ?? undefined,
                number: supplier?.address?.number ?? undefined,
                zipCode: supplier?.address?.zipCode ?? undefined,
                state: supplier?.address?.state ?? undefined,
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
            notifications.show({ color: "red", message: "Sessão inválida" });
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
                message: "Fornecedor atualizado com sucesso.",
                color: "green"
            });

            reset();
            mutate();
            handleClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message: "Erro ao atualizar o fornecedor.",
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
            onClose={handleClose}
            title={"Atualizar Fornecedor"}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(handleUpdateSupplier, handleFormErrors)} className="flex flex-col gap-4">
                <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Informações da Empresa"}</h2>

                    <TextInput
                        {...register("name")}
                        label={"Nome"}
                        placeholder={"Digite Aqui"}
                        error={errors?.name?.message}
                        required
                    />
                    <TextInput
                        {...register("corporateReason")}
                        label={"Razão Social"}
                        placeholder={"Digite Aqui"}
                        error={errors?.corporateReason?.message}
                    />
                    <TextInput
                        {...register("documentType")}
                        label={"Tipo de Documento"}
                        placeholder={"Digite Aqui"}
                        error={errors?.documentType?.message}
                    />
                    <TextInput
                        {...register("document")}
                        label={"Documento"}
                        placeholder={"Digite Aqui"}
                        error={errors?.document?.message}
                    />

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
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >
                    {"Salvar"}
                </Button>
            </form>
            <LoadingOverlay visible={isLoading} />
        </Modal>
    );
}

