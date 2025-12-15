"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import {
  CreateFormsOfReceiptInput,
  createFormsOfReceiptSchema,
} from "@/schemas/financial/forms-receipt.schema";
import FormsOfReceipt__BasicInformations from "./basic-informations";
import FormsOfReceipt__Fees from "./feeForm";
import { KeyedMutator } from "swr";
import { FormsOfReceipt } from "..";
import { authedFetch } from "@/utils/authedFetch";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mutate: () => void | KeyedMutator<FormsOfReceipt[]>;
};

export default function NewFormsOfReceipt({
  opened,
  onClose,
  onSuccess,
  mutate,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateFormsOfReceiptInput>({
    resolver: zodResolver(createFormsOfReceiptSchema) as any,
    defaultValues: { name: "", operator: "", fees: [] },
  });

  const { data: sessionData } = useSession();

  async function createFormsOfReceipt(data: CreateFormsOfReceiptInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authedFetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/forms-of-receipt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to create forms of receipt");
      notifications.show({ message: "Forma de recebimento criada com sucesso", color: "green" });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        message: "Falha ao criar forma de recebimento",
        color: "red",
      });
    } finally {
      setIsLoading(false);
      mutate();
    }
  }

  const handleFormErrors = (err: any) => {
    console.warn("Validation errors:", err);
    notifications.show({
      message: "Erro de validação.",
      color: "yellow",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Novo Método de Recebimento"}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit(createFormsOfReceipt, handleFormErrors)}
        className="flex flex-col gap-4"
      >
        <LoadingOverlay visible={isLoading} />
        <FormsOfReceipt__BasicInformations
          register={register as any}
          errors={errors}
        />
        <FormsOfReceipt__Fees
          control={control as any}
          register={register as any}
          errors={errors}
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
