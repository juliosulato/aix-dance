"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import { authedFetch } from "@/utils/authedFetch";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import {
  UpdateCategoryBillInput,
  updateCategoryBillSchema,
} from "@/schemas/financial/category-bill.schema";
import CategoryBill__BasicInformations from "./basic-informations";
import { KeyedMutator } from "swr";
import { CategoryBill } from "@/types/bill.types";

type Props = {
  opened: boolean;
  mutate: KeyedMutator<CategoryBill[]>;
  onClose: () => void;
  category: CategoryBill | null;
};

export default function UpdateCategoryBill({
  opened,
  onClose,
  mutate,
  category,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<UpdateCategoryBillInput>({
    resolver: zodResolver(updateCategoryBillSchema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        groupId: category.groupId,
        nature: category.nature,
        parentId: category.parentId,
        type: category.type,
      });
    }
  }, [category, reset]);

  const { data: sessionData } = useSession();

  async function createCategoryBill(data: UpdateCategoryBillInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authedFetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/category-bills/${category?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (responseData.code) {
        notifications.show({
          message: "Categoria já existe",
          color: "yellow",
        });
      }

      if (!response.ok) throw new Error("Failed to create category bill");

      notifications.show({
        message: "Categoria atualizada com sucesso",
        color: "green",
      });
      reset();
      mutate();
      onClose();
    } catch (error: any) {
      console.error("ERROR", error);
      notifications.show({
        title: "Erro",
        message: "Erro inesperado",
        color: "red",
      });
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
      title="Editar Categoria"
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
          <CategoryBill__BasicInformations
            control={control}
            errors={errors}
            register={register}
            tenancyId={sessionData.user.tenancyId}
          />
        )}
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
