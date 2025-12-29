"use client";

import { useState } from "react";
import {
  Control,
  FieldErrors,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { authedFetch } from "@/utils/authedFetch";

import {
  CreateBankInput,
  createBankSchema,
  UpdateBankInput,
} from "@/schemas/financial/bank.schema";
import NewBank__BasicInformations from "./basic-informations";
import { KeyedMutator } from "swr";
import { Bank } from "@/types/bank.types";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: () => void | KeyedMutator<Bank[]>;
};

export default function NewBankAccount({ opened, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateBankInput>({
    resolver: zodResolver(createBankSchema) as any,
    defaultValues: {
      name: "",
      account: "",
      agency: "",
      code: "",
      description: "",
      maintenanceFeeAmount: undefined,
      maintenanceFeeDue: undefined,
    },
  });

  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return <LoadingOverlay visible />;
  }

  async function createBank(data: CreateBankInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authedFetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/banks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create bank");
      }

      notifications.show({
        message: "Banco criado com sucesso",
        color: "green",
      });

      reset();
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Erro",
        message: "Erro inesperado",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormErrors = (errors: any) => {
    console.warn("Validation errors:", errors);
    notifications.show({
      title: "Erro de validação",
      message: "Verifique os dados informados",
      color: "yellow",
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Nova Conta Bancária"
        size="lg"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form
          onSubmit={handleSubmit(createBank, handleFormErrors)}
          className="flex flex-col gap-4"
        >
          <NewBank__BasicInformations
            control={control as Control<UpdateBankInput>}
            errors={errors as FieldErrors<UpdateBankInput>}
            register={register as UseFormRegister<UpdateBankInput>}
          />
          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
            loading={isLoading}
          >
            Salvar
          </Button>
        </form>
      </Modal>
      <LoadingOverlay visible={isLoading} />
    </>
  );
}
