"use client";

import { useActionState, useEffect } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { LoadingOverlay, Modal } from "@mantine/core";
import {
  CreateFormsOfReceiptInput,
  createFormsOfReceiptSchema,
} from "@/schemas/financial/forms-receipt.schema";
import { createFormOfReceipt } from "@/actions/financial/formsOfReceipt/create";
import { ActionState } from "@/types/server-actions.types";
import FormFormsOfReceipt from "./FormFormsOfReceipt";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const initialState: ActionState<CreateFormsOfReceiptInput> = {
  success: false,
  error: undefined,
  errors: {},
};

export default function NewFormsOfReceipt({ opened, onClose }: Props) {
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    reset
  } = useForm<CreateFormsOfReceiptInput>({
    resolver: zodResolver(createFormsOfReceiptSchema)
  });

  const [state, formAction, pending] = useActionState(
    createFormOfReceipt,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onClose?.();
      notifications.show({
        message: "Forma de recebimento criada com sucesso",
        color: "green",
      });
    }
  }, [state.success]);

  useEffect(() => {
    if (!opened) {
      reset()
    }
  }, [opened]);

  useEffect(() => {
    if (state.error) {
      notifications.show({
        title: "Erro",
        message: state.error,
        color: "red",
      });
    }
  }, [state.error]);
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Novo Forma de Recebimento"}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <FormFormsOfReceipt control={control as Control<any>} errors={errors} pending={pending} register={register as UseFormRegister<any>} onSubmit={handleSubmit((data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("operator", data?.operator || "");
        formData.append("fees", JSON.stringify(data.fees));

        formAction(formData);
      })}/>
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
