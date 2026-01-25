"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";

import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { KeyedMutator } from "swr";
import { Modality } from "@/types/class.types";
import {
  UpdateModalityInput,
  updateModalitySchema,
} from "@/schemas/academic/modality.schema";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<Modality[]>;
  modality: Modality;
};

export default function UpdateModalities({
  opened,
  onClose,
  mutate,
  modality,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Usamos o schema estático

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<UpdateModalityInput>({
    resolver: zodResolver(updateModalitySchema) as any,
  });

  useEffect(() => {
    if (modality) {
      reset({
        name: modality.name,
      });
    }
  }, [modality, reset]);

  const { data: sessionData } = useSession();

  async function updateModality(data: UpdateModalityInput) {
    if (!sessionData?.user.tenantId) {
      notifications.show({ color: "red", message: "Sessão Inválida" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/tenants/${sessionData.user.tenantId}/academic/modalities/${modality.id}`,
        {
          method: "PUT",
                credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();


      if (!response.ok) {
        if (responseData.code === "MODALITY_ALREADY_EXISTS") {
          notifications.show({
            message: "Já existe uma modalidade com esse nome.",
            color: "yellow"
          });
          return;
        }

        notifications.show({
          message: responseData.message || "Erro ao criar modalidade.",
          color: "red"
        });
        return;
      }

      notifications.show({
        message: "Modalidade atualizada com sucesso.",
        color: "green",
      });

      reset();
      await mutate();
      onClose();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormErrors = () => {
    notifications.show({
      message: "Erro de validação.",
      color: "yellow",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Atualizar Modalidade"}
      size="lg"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit(updateModality, handleFormErrors)}
        className="flex flex-col gap-4"
      >
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
          className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
        >
          Salvar
        </Button>
      </form>
    </Modal>
  );
}
