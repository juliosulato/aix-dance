"use client";

import { useFieldArray, Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form";

import { Button, ActionIcon, NumberInput, Checkbox } from "@mantine/core";
import { FaPercentage } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { CreateFormsOfReceiptInput, UpdateFormsOfReceiptInput } from "@/schemas/financial/forms-receipt.schema";


export default function FormsOfReceipt__Fees({
  control,
  register,
  errors,
}: {
  control: Control<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  register: UseFormRegister<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  errors: FieldErrors<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "fees" });

  return (
    <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:gap-4 md:flex-row justify-between items-center">
        <h2 className="text-lg font-bold">Taxas</h2>
        <Button
          size="xs"
          variant="light"
          color="violet"
          className="!w-full md:!w-fit"
          onClick={() =>
            append({
              minInstallments: 1,
              maxInstallments: 1,
              feePercentage: 0,
              customerInterest: false,
              receiveInDays: 0,
            })
          }
        >
          {"Adicionar Taxa"}
        </Button>
      </div>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-3 border border-neutral-200 rounded-lg flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative"
        >
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 z-10 col-span-2 md:col-span-3 ml-auto"
          >
            <RiDeleteBinLine size={18} />
          </ActionIcon>

          <Controller
            control={control}
            name={`fees.${index}.minInstallments`}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={"Mínimo de Parcelas"}
                placeholder="1"
                error={errors.fees?.[index]?.minInstallments?.message}
              />
            )}
          />

          {/* maxInstallments */}
          <Controller
            control={control}
            name={`fees.${index}.maxInstallments`}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={"Máximo de Parcelas"}
                placeholder="12"
                error={errors.fees?.[index]?.maxInstallments?.message}
              />
            )}
          />

          {/* feePercentage */}
          <Controller
            control={control}
            name={`fees.${index}.feePercentage`}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={"Percentual (%)"}
                placeholder="2.99"
                decimalScale={2}
                fixedDecimalScale
                leftSection={<FaPercentage />}
                error={errors.fees?.[index]?.feePercentage?.message}
              />
            )}
          />

          {/* receiveInDays */}
          <Controller
            control={control}
            name={`fees.${index}.receiveInDays`}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={"Recebe em (dias)"}
                placeholder="30"
                error={errors.fees?.[index]?.receiveInDays?.message}
              />
            )}
          />

          {/* customerInterest pode usar register */}
          <Checkbox
            label={"Juros ao cliente"}
            {...register(`fees.${index}.customerInterest`)}
            className="col-span-2 md:col-span-3 self-center mt-2"
          />
        </div>
      ))}
      {errors.fees?.message && (
        <p className="text-red-500 text-xs mt-1">{errors.fees.message}</p>
      )}
    </div>
  );
}
