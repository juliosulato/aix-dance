"use client";

import { useEffect } from "react";
import { Control, useForm, UseFormRegister, UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingOverlay, Modal } from "@mantine/core";

// Hooks e Types
import { useFormAction } from "@/hooks/useFormAction";
import { ActionState } from "@/types/server-actions.types";
import { FormsOfReceipt } from "@/types/receipt.types";

// Schemas e Actions
import {
  CreateFormsOfReceiptInput,
  createFormsOfReceiptSchema,
  UpdateFormsOfReceiptInput,
  updateFormsOfReceiptSchema,
} from "@/schemas/financial/forms-receipt.schema";
import { createFormOfReceipt } from "@/actions/financial/formsOfReceipt/create";
import { updateFormOfReceipt } from "@/actions/financial/formsOfReceipt/update";

import FormFormsOfReceipt from "./FormFormsOfReceipt";
import { ZodType } from "zod";

type Props = {
  opened: boolean;
  onClose: () => void;
  selectedItem?: FormsOfReceipt | null;
};

const initialState: ActionState<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput> = {
  success: false,
  error: undefined,
  errors: {},
};

export default function FormsOfReceiptModal({
  opened,
  onClose,
  selectedItem,
}: Props) {
  const schema = selectedItem ? updateFormsOfReceiptSchema : createFormsOfReceiptSchema;

  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    reset,
    setValue,
    watch
  } = useForm<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      operator: "",
      fees: [],
    },
  });

  const { formAction, pending, state } = useFormAction({
    action: selectedItem ? updateFormOfReceipt : createFormOfReceipt,
    initialState,
    onClose,
    successMessage: selectedItem
      ? "Forma de recebimento atualizada com sucesso"
      : "Forma de recebimento criada com sucesso",
  });

  useEffect(() => {
    if (opened) {
      if (selectedItem) {
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
      } else {
        reset({
          name: "",
          operator: "",
          fees: [],
        });
      }
    }
  }, [opened, selectedItem, reset]);

  const handleSave = (data: CreateFormsOfReceiptInput) => {
    const formData = new FormData();
    
    if (selectedItem) {
      formData.append("id", selectedItem.id);
    }

    formData.append("name", data.name);
    formData.append("operator", data?.operator || "");
    formData.append("fees", JSON.stringify(data.fees));

    formAction(formData);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={selectedItem ? "Editar Forma de Recebimento" : "Nova Forma de Recebimento"}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <FormFormsOfReceipt
        control={control as Control<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>}
        errors={errors}
        pending={pending}
        setValue={setValue}
        register={register as UseFormRegister<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>}
        onSubmit={handleSubmit(handleSave as any)} 
        watch={watch as UseFormWatch<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>}
        selectedItem={selectedItem}
      />
      <LoadingOverlay visible={pending} />
      
      {state.error && (
        <p className="text-red-500 text-sm mt-2 text-center">{state.error}</p>
      )}
    </Modal>
  );
}