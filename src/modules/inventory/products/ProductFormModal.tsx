"use client";

import { saveProductAction } from "@/actions/inventory/products.actions";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";
import { useFormAction } from "@/hooks/useFormAction";
import {
  CreateProductInput,
  createProductSchema,
  UpdateProductInput,
  updateProductSchema,
} from "@/schemas/inventory/product.schema";
import { Product } from "@/types/product.types";
import { buildPayload } from "@/utils/server-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  ScrollAreaAutosize,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { IoIosWarning } from "react-icons/io";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

type ProductType = CreateProductInput | UpdateProductInput;

type Props = {
  opened: boolean;
  onClose: () => void;
  isEditing?: Product;
};

const initialState = { error: undefined, errors: {} };

export default function ProductFormModal({
  opened,
  onClose,
  isEditing,
}: Props) {
  const schema = !isEditing ? createProductSchema : updateProductSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<ProductType>({
    resolver: zodResolver(schema),
    defaultValues: {
      stock: 1,
      minStock: 1,
      price: 1,
      priceOfCost: 0,
      isActive: true,
      id: isEditing ? isEditing.id : undefined,
    },
    mode: "onChange",
  });

  const { formAction, pending, state } = useFormAction<ProductType, FormData>({
    action: saveProductAction,
    initialState,
    onClose,
    successMessage: isEditing
      ? "Produto atualizado com sucesso!"
      : "Produto criado com sucesso!",
  });

  const handleSave = (data: ProductType) => {
    const payload = buildPayload(data);
    notifications.show({ message: "Salvando produto..." });
    formAction(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Novo Produto"}
      size="xl"
      radius="lg"
      centered
      scrollAreaComponent={ScrollAreaAutosize}
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit(handleSave, (err) => console.error(err))}
        className="flex flex-col gap-4"
      >
        {isEditing && (
          <input type="hidden" value={isEditing.id} name="id" id="id" />
        )}
        {JSON.stringify(isEditing)}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Imagem do Produto
          </label>
          <AvatarUpload control={control} />
        </div>
        <TextInput
          label="Nome"
          placeholder="Nome do produto"
          {...register("name")}
          error={errors.name?.message as unknown as string}
        />

        <TextInput
          label="Código de Barras"
          placeholder="Digite o código de barras"
          {...register("barcode")}
          error={errors.barcode?.message as unknown as string}
        />

        <Textarea
          label="Descrição"
          placeholder="Descrição do produto"
          {...register("description")}
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
                leftSection={<RiMoneyDollarCircleFill color="black" />}
                min={0}
                {...field}
                onChange={(val) => field.onChange(val)}
                value={field.value as number | undefined}
                error={errors.price?.message as unknown as string}
                required
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
                leftSection={<RiMoneyDollarCircleFill color="black" />}
                step={0.01}
                min={0}
                decimalSeparator=","
                {...field}
                onChange={(val) => field.onChange(val)}
                value={field.value as number | undefined}
                error={errors.priceOfCost?.message as unknown as string}
              />
            )}
          />
        </Group>

        {!isEditing && (
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
                  error={
                    (errors as unknown as FieldErrors<CreateProductInput>).stock
                      ?.message
                  }
                  required
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
                  error={
                    (errors as unknown as FieldErrors<CreateProductInput>)
                      .minStock?.message
                  }
                  required
                />
              )}
            />
          </Group>
        )}

        <Group grow>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="Categoria"
                placeholder="Selecione uma categoria"
                data={[]}
                {...field}
                onChange={(val) => field.onChange(val)}
                value={field.value as string | null}
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
                {...field}
                onChange={(val) => field.onChange(val)}
                value={field.value as string | null}
                error={errors.supplierId?.message as unknown as string}
              />
            )}
          />
        </Group>

        <Group grow>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                data={[
                  { value: "true", label: "Ativo" },
                  { value: "false", label: "Inativo" },
                ]}
                value={String(field.value)}
                onChange={(val) => field.onChange(val === "true")}
                error={errors.isActive?.message as unknown as string}
              />
            )}
          />
        </Group>

        {state.error && (
          <Alert color="red" icon={<IoIosWarning />}>
            {state.error}
          </Alert>
        )}

        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="lg"
          className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
          loading={pending}
        >
          Salvar
        </Button>
      </form>
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
