"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";

import {
  UpdateBankInput,
  createBankSchema,
} from "@/schemas/financial/bank.schema";
import NewBank__BasicInformations from "./basic-informations";
import { Bank } from "@prisma/client";
import { KeyedMutator } from "swr";
type Props = {
  bankAccount: Bank | null;
  opened: boolean;
  onClose: () => void;
  mutate: () => void | KeyedMutator<Bank[]>;
};

export default function UpdateBankAccount({
  opened,
  onClose,
  bankAccount,
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
  } = useForm<UpdateBankInput>({
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

  useEffect(() => {
    if (bankAccount) {
      reset({
        name: bankAccount.name,
        account: bankAccount.account ?? undefined,
        agency: bankAccount.agency ?? undefined,
        code: bankAccount.code ?? undefined,
        description: bankAccount.description ?? undefined,
        maintenanceFeeAmount:
          Number(bankAccount.maintenanceFeeAmount) ?? undefined,
        maintenanceFeeDue: bankAccount.maintenanceFeeDue ?? undefined,
      });
    }
  }, [bankAccount, reset]);

  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return <LoadingOverlay visible />;
  }

  async function createBank(data: UpdateBankInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/banks/${bankAccount?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create bank");
      }

      notifications.show({
        message: "Conta bancária atualizada com sucesso",
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
      mutate();
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
        title="Editar Conta Bancária"
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
            control={control}
            errors={errors}
            register={register}
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
