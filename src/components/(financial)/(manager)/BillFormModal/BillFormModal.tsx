"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingOverlay, Modal } from "@mantine/core";
import {
  CreateBillInput,
  createBillSchema,
  UpdateBillInput,
  updateBillSchema,
} from "@/schemas/financial/bill.schema";
import { KeyedMutator } from "swr";
import { BillComplete } from "@/types/bill.types";
import { ZodType } from "zod";
import { Bank } from "@/types/bank.types";
import { Supplier } from "@/types/supplier.types";
import { CategoryBill } from "@/types/category.types";
import { createBill } from "@/actions/financial/bills/create";
import { useFormAction } from "@/hooks/useFormAction";
import { ActionState } from "@/types/server-actions.types";
import { SessionData } from "@/lib/auth-server";
import BillForm from "./BillForm";
import { updateBill } from "@/actions/financial/bills/update";
import Decimal from "decimal.js";
import { useEffect } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate?: KeyedMutator<BillComplete[]>;
  user: SessionData["user"];
  banks: Bank[];
  suppliers: Supplier[];
  categories: CategoryBill[];
  isEditing?: BillComplete;
};

const initialState: ActionState<CreateBillInput | UpdateBillInput> = {
  error: undefined,
  errors: {
    amount: undefined,
    dueDate: undefined,
    description: undefined,
    supplierId: undefined,
    categoryId: undefined,
    bankId: undefined,
  },
  success: false,
};

export default function BillFormModal({
  opened,
  onClose,
  mutate,
  banks,
  suppliers,
  categories,
  isEditing,
}: Props) {
  const schema = isEditing ? updateBillSchema : createBillSchema;
  const action = isEditing ? updateBill : createBill;

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    watch,
    setValue,
    reset
  } = useForm<CreateBillInput | UpdateBillInput>({
    resolver: zodResolver(schema as ZodType<CreateBillInput | UpdateBillInput, any, any>),
    defaultValues: isEditing
      ? {
          ...isEditing,
          amount:
            isEditing.amount instanceof Decimal
              ? isEditing.amount.toNumber()
              : isEditing.amount || 0,
          amountPaid:
            isEditing.amountPaid instanceof Decimal
              ? isEditing.amountPaid.toNumber()
              : isEditing.amountPaid || 0,
          recurrence: isEditing.recurrence || undefined,
          studentId: isEditing?.studentId || undefined,
          supplierId: isEditing?.supplierId || undefined,
          categoryId: isEditing?.categoryId || undefined,
          bankId: isEditing?.bankId || undefined,
          formsOfReceiptId: isEditing?.formsOfReceiptId || undefined,
          dueDate: isEditing.dueDate ? new Date(isEditing.dueDate) : undefined,
          type: isEditing.type || "PAYABLE",
          updateScope: "ONE"
        }
      : { paymentMode: "ONE_TIME", recurrence: "NONE", installments: 1 },
  });

  const { state, formAction, pending } = useFormAction<
    CreateBillInput | UpdateBillInput
  >({
    action: action,
    initialState,
    onClose,
    successMessage: isEditing
      ? "Conta atualizada com sucesso!"
      : "Conta criada com sucesso!",
  });

  const handleSave = async (data: CreateBillInput | UpdateBillInput) => {
    const formData = new FormData();

    if (isEditing) {
      formData.append("id", isEditing.id);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    });

    formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      mutate?.()
      reset();
    }
  }, [state.success])


  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nova Conta"
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <BillForm
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        onSubmit={handleSubmit(handleSave as any, (err, ev) => console.error(err, ev))}
        banks={banks}
        suppliers={suppliers}
        categories={categories}
        pending={pending}
        isEditing={isEditing}
      />
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
