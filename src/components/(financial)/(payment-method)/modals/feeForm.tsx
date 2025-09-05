"use client";

import { useFieldArray, Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button, ActionIcon, NumberInput, Checkbox } from "@mantine/core";
import { FaPercentage } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { CreatePaymentMethodInput, UpdatePaymentMethodInput } from "@/schemas/financial/payment-method.schema";


export default function PaymentMethod__Fees({
  control,
  register,
  errors,
}: {
  control: Control<CreatePaymentMethodInput | UpdatePaymentMethodInput>;
  register: UseFormRegister<CreatePaymentMethodInput | UpdatePaymentMethodInput>;
  errors: FieldErrors<CreatePaymentMethodInput | UpdatePaymentMethodInput>;
}) {
  const t = useTranslations("financial.paymentMethods.modals");
  const { fields, append, remove } = useFieldArray({ control, name: "fees" });

  return (
    <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t("content.feesSubtitle")}</h2>
        <Button
          size="xs"
          variant="light"
          color="violet"
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
          {t("content.addFeeButton")}
        </Button>
      </div>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-3 border border-neutral-200 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4 relative"
        >
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 z-10 col-span-2 md:col-span-3 ml-auto"
          >
            <RiDeleteBinLine size={18} />
          </ActionIcon>

          {/* minInstallments */}
          <Controller
            control={control}
            name={`fees.${index}.minInstallments`}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={t("content.fields.fees.minInstallments")}
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
                label={t("content.fields.fees.maxInstallments")}
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
                label={t("content.fields.fees.feePercentage")}
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
                label={t("content.fields.fees.receiveInDays")}
                placeholder="30"
                error={errors.fees?.[index]?.receiveInDays?.message}
              />
            )}
          />

          {/* customerInterest pode usar register */}
          <Checkbox
            label={t("content.fields.fees.customerInterest")}
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
