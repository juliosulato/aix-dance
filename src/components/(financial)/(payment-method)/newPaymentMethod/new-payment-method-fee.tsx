import { Controller, useFieldArray } from "react-hook-form";
import { NumberInput, Checkbox, ActionIcon, Button } from "@mantine/core";
import { FaPercentage } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { CreatePaymentMethodInput } from "@/schemas/financial/payment-method.schema";

export default function NewPaymentMethod__Fees({
  control,
  errors,
}: {
  control: any; // ou Control<CreatePaymentMethodInput>
  errors: any;  // ou FieldErrors<CreatePaymentMethodInput>
}) {
  const t = useTranslations("financial.paymentMethods.modals.create");
  const { fields, append, remove } = useFieldArray({ control, name: "fees" });

  return (
    <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t("feesSubtitle")}</h2>
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
          {t("addFeeButton")}
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
            className="absolute top-2 right-2 z-10"
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
                label={t("fields.fees.minInstallments")}
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
                label={t("fields.fees.maxInstallments")}
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
                label={t("fields.fees.feePercentage")}
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
                label={t("fields.fees.receiveInDays")}
                placeholder="30"
                error={errors.fees?.[index]?.receiveInDays?.message}
              />
            )}
          />

          {/* customerInterest */}
          <Controller
            control={control}
            name={`fees.${index}.customerInterest`}
            render={({ field }) => (
              <Checkbox
                {...field}
                checked={field.value}
                label={t("fields.fees.customerInterest")}
                className="col-span-2 md:col-span-3 self-center mt-2"
              />
            )}
          />
        </div>
      ))}

      {errors.fees?.message && (
        <p className="text-red-500 text-xs mt-1">{errors.fees.message}</p>
      )}
    </div>
  );
}
