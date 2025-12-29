"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import {
  CreateCategoryBillInput,
  createCategoryBillSchema,
} from "@/schemas/financial/category-bill.schema";
import NewCategoryBill__BasicInformations from "./basic-informations";
import { KeyedMutator } from "swr";
import { CategoryBill } from "@/types/bill.types";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<CategoryBill[]>;
};

export default function NewCategoryBill({ opened, onClose, mutate }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateCategoryBillInput>({
    resolver: zodResolver(createCategoryBillSchema),
  });

  const { data: sessionData, isPending } = useSession();

  async function createCategoryBill(data: CreateCategoryBillInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/category-bills`,
        {
          method: "POST",
                credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (responseData.code) {
        notifications.show({
          message: "Erro ao criar categoria",
          color: "yellow",
        });
      }

      if (!response.ok) throw new Error("Failed to create category bill");

      notifications.show({
        message: "Categoria criada com sucesso",
        color: "green",
      });
      reset();
      mutate();
      onClose();
    } catch (error: any) {
      console.error(error);

      if (error?.code == "CATEGORY_ALREADY_EXISTS") {
        notifications.show({
          message: "Categoria já existe",
          color: "yellow",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormErrors = () => {
    notifications.show({
      title: "Erro de validação",
      message: "Verifique os dados informados",
      color: "yellow",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nova Categoria"
      size="lg"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit(createCategoryBill, handleFormErrors)}
        className="flex flex-col gap-4"
      >
        <LoadingOverlay visible={isLoading} />
        {sessionData?.user.tenancyId && (
          <NewCategoryBill__BasicInformations
            control={control as any}
            errors={errors}
            register={register as any}
            tenancyId={sessionData.user.tenancyId}
          />
        )}
        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="md"
          loading={isLoading}
          className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
        >
          Salvar
        </Button>
      </form>
    </Modal>
  );
}
