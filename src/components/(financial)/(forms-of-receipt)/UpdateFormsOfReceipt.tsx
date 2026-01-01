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
import { ActionState } from "@/types/server-actions.types";
import FormFormsOfReceipt from "./FormFormsOfReceipt";
import { updateFormOfReceipt } from "@/actions/financial/formsOfReceipt/update";
import { FormsOfReceipt } from "@/types/receipt.types";

type Props = {
  opened: boolean;
  onClose: () => void;
  selectedItem: FormsOfReceipt;
};

const initialState: ActionState<CreateFormsOfReceiptInput> = {
  success: false,
  error: undefined,
  errors: {},
};

export default function UpdateFormsOfReceipt({
  opened,
  onClose,
  selectedItem,
}: Props) {
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm<CreateFormsOfReceiptInput>({
    resolver: zodResolver(createFormsOfReceiptSchema)
  });

  const [state, formAction, pending] = useActionState(
    updateFormOfReceipt,
    initialState
  );

  useEffect(() => {
    if (opened && selectedItem) {
      reset({
        name: selectedItem.name,
        operator: selectedItem.operator ?? "",
        fees:
          selectedItem.fees?.map((fee) => ({
            minInstallments: fee.minInstallments,
            maxInstallments: fee.maxInstallments,
            feePercentage: fee.feePercentage,
            customerInterest: fee.customerInterest,
            receiveInDays: fee.receiveInDays ?? 0,
          })) ?? [],
      });
    }
  }, [opened, selectedItem, reset]);

  useEffect(() => {
    if (state.success) {
      onClose?.();
      notifications.show({
        message: "Forma de recebimento atualizada com sucesso",
        color: "green",
      });
    }
  }, [state.success]);

  useEffect(() => {
    if (!opened) {
      reset();
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
      title={"Atualizar Forma de Recebimento"}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <FormFormsOfReceipt
        control={control as Control<any>}
        errors={errors}
        pending={pending}
        register={register as UseFormRegister<any>}
        onSubmit={handleSubmit((data) => {
          const formData = new FormData();
          formData.append("name", data.name);
          formData.append("operator", data?.operator || "");
          formData.append("fees", JSON.stringify(data.fees));

          formAction(formData);
        })}
      />
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
