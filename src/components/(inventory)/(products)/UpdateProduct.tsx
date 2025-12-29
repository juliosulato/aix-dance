"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal, TextInput, NumberInput, Textarea, Group, Select, ScrollAreaAutosize } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { authedFetch } from "@/utils/authedFetch";
import { useState, useEffect } from "react";
import ProductImageUpload from "./ProductImageUpload";
import { KeyedMutator } from "swr";
import { Product } from "@/types/product.types";
import { UpdateProductInput, updateProductSchema } from "@/schemas/inventory/product.schema";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<{
        products: Product[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>;
    product: Product;
};

export default function UpdateProduct({ opened, onClose, mutate, product }: Props) {

    const [visible, setVisible] = useState(false);

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<UpdateProductInput>({
        resolver: zodResolver(updateProductSchema),
        defaultValues: {
            stock: 0,
            minStock: 1,
            isActive: true
        }
    });

    // when the product or opened changes, populate the form
    useEffect(() => {
        if (opened && product) {
            reset({
                name: product.name ?? undefined,
                description: product.description ?? undefined,
                price: product.price !== undefined && product.price !== null ? Number(product.price as any) : undefined,
                stock: product.stock ?? 0,
                minStock: product.minStock ?? 1,
                categoryId: product.categoryId ?? undefined,
                supplierId: product.supplierId ?? undefined,
                isActive: product.isActive ?? true,
                barcode: product.barcode ?? undefined,
            });
        }
    }, [opened, product, reset]);

    const { data: sessionData, status } = useSession();
    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;

    async function updateProduct(data: UpdateProductInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        if (!product?.id) {
            notifications.show({ color: "red", message: "Produto inválido" });
            return;
        }

        notifications.show({ message: "Atualizando produto...", color: "blue" });

        setVisible(true);
        try {
            // apply schema parse to ensure types/defaults
            const payload = updateProductSchema.parse(data);

            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/inventory/products/${product.id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to update product.");

            notifications.show({
                message: "Produto atualizado com sucesso!",
                color: "green"
            });
            reset();
            mutate();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message:"Erro interno. Tente novamente.",
                color: "red"
            });
        } finally {
            setVisible(false);
        }
    }

    const onError = (errors: any) => console.log("Erros de validação:", errors);

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={product ? "Editar Produto" : "Novo Produto"}
                size="xl"
                radius="lg"
                centered
                scrollAreaComponent={ScrollAreaAutosize}
                classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
            >
                <form onSubmit={handleSubmit(updateProduct, onError)} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Imagem do Produto</label>
                        <ProductImageUpload
                            productId={product.id}
                            initialUrl={product.image ?? undefined}
                            onUpdated={mutate}
                        />
                    </div>
                    <TextInput
                        label="Nome"
                        placeholder="Nome do produto"
                        {...register('name')}
                        error={errors.name?.message as unknown as string}
                    />

                    <TextInput
                        label="Código de Barras"
                        placeholder="Digite o código de barras"
                        {...register('barcode')}
                        error={errors.barcode?.message as unknown as string}
                    />

                    <Textarea
                        label="Descrição"
                        placeholder="Descrição do produto"
                        {...register('description')}
                        error={errors.description?.message as unknown as string}
                    />

                    <Group grow>
                     <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                label="Preço"
                                placeholder="0,00"
                                step={0.01}
                                decimalSeparator=","
                                leftSection={<RiMoneyDollarCircleFill color="black"/>}
                                min={0}
                                {...field}
                                onChange={(val) => field.onChange(val)}
                                value={field.value as number | undefined}
                                error={errors.price?.message as unknown as string}
                            />
                        )}
                    />

                    <Controller
                        name="priceOfCost"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                label="Preço de Custo"
                                placeholder="0,00"
                                leftSection={<RiMoneyDollarCircleFill color="black"/>}
                                step={0.01}
                                min={0}
                                decimalSeparator=","
                                {...field}
                                onChange={(val) => field.onChange(val)}
                                value={field.value as number | undefined}
                                error={errors.price?.message as unknown as string}
                            />
                        )}
                    />
                   </Group>

                    <Group grow>
                        <Controller
                            name="stock"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Estoque"
                                    min={0}
                                    {...field}
                                    onChange={(val) => field.onChange(val)}
                                    value={field.value as number}
                                    error={errors.stock?.message as unknown as string}
                                />
                            )}
                        />

                        <Controller
                            name="minStock"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Estoque mínimo"
                                    min={0}
                                    {...field}
                                    onChange={(val) => field.onChange(val)}
                                    value={field.value as number}
                                    error={errors.minStock?.message as unknown as string}
                                />
                            )}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Categoria"
                                    placeholder="Selecione uma categoria"
                                    data={[]}
                                    searchable
                                    clearable
                                    {...field}
                                    onChange={(val) => field.onChange(val)}
                                    value={field.value as string | undefined}
                                    error={errors.categoryId?.message as unknown as string}
                                />
                            )}
                        />

                        <Controller
                            name="supplierId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Fornecedor"
                                    placeholder="Selecione um fornecedor"
                                    data={[]}
                                    searchable
                                    clearable
                                    {...field}
                                    onChange={(val) => field.onChange(val)}
                                    value={field.value as string | undefined}
                                    error={errors.supplierId?.message as unknown as string}
                                />
                            )}
                        />
                    </Group>

                   

                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="lg"
                        fullWidth={false}
                        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                    >
                       Salvar
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
