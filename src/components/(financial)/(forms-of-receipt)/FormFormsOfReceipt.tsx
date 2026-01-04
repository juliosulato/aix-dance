"use client";

import {
  useFieldArray,
  Control,
  FieldErrors,
  UseFormRegister,
  Controller,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import {
  Button,
  ActionIcon,
  NumberInput,
  Checkbox,
  TextInput,
} from "@mantine/core";
import { FaPercentage } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  CreateFormsOfReceiptInput,
  UpdateFormsOfReceiptInput,
} from "@/schemas/financial/forms-receipt.schema";
import { FormsOfReceipt } from "@/types/receipt.types";

type Props = {
  control: Control<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  register: UseFormRegister<
    CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput
  >;
  errors: FieldErrors<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  pending: boolean;
  setValue: UseFormSetValue<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  watch: UseFormWatch<CreateFormsOfReceiptInput | UpdateFormsOfReceiptInput>;
  onSubmit: () => void;
  selectedItem?: FormsOfReceipt | null;
};

export default function FormFormsOfReceipt({
  control,
  register,
  errors,
  pending,
  onSubmit,
  selectedItem,
  setValue,
  watch,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fees",
    shouldUnregister: false,
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {selectedItem && (
        <input type="hidden" value={selectedItem.id} {...register("id")} />
      )}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold md:col-span-2">Informações Básicas</h2>
        <TextInput
          label={"Nome"}
          placeholder={"Nome da forma de recebimento"}
          {...register("name")}
          error={errors.name?.message}
          required
        />
        <TextInput
          label={"Operadora"}
          placeholder={"Operadora (ex: Cielo, Stone)"}
          {...register("operator")}
          error={errors.operator?.message}
        />
      </div>
      <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:gap-4 md:flex-row justify-between items-center">
          <h2 className="text-lg font-bold">Taxas</h2>
          <Button
            size="xs"
            variant="light"
            color="violet"
            className="w-full! md:w-fit!"
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
        {fields.map((field, index) => {
          const prevMax =
            index > 0 ? watch(`fees.${index - 1}.maxInstallments`) : 0;

          return (
            <div className="form-card-grid">
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 z-10 col-span-2 md:col-span-3 ml-auto"
              >
                {" "}
                <RiDeleteBinLine size={18} />{" "}
              </ActionIcon>
              <Controller
                control={control}
                name={`fees.${index}.minInstallments`}
                rules={{
                  min: 1,
                  validate: (value = 0) => {
                    if (index === 0) return true;
                    const prevMax =
                      watch(`fees.${index - 1}.maxInstallments`) || 0;
                    return (
                      value > prevMax ||
                      `O mínimo deve ser maior que o máximo do item anterior (${prevMax})`
                    );
                  },
                }}
                render={({ field: f }) => {
                  const prevMax =
                    index > 0
                      ? watch(`fees.${index - 1}.maxInstallments`) || 0
                      : 0;

                  return (
                    <NumberInput
                      {...f}
                      label="Mínimo de Parcelas"
                      placeholder="1"
                      min={prevMax + 1}
                      onChange={(value = 0) => {
                        f.onChange(Number(value));

                        const currentMax =
                          watch(`fees.${index}.maxInstallments`) || 0;
                        if (currentMax <= Number(value)) {
                          setValue(`fees.${index}.maxInstallments`, Number(value) + 1);
                        }
                      }}
                      error={errors.fees?.[index]?.minInstallments?.message}
                    />
                  );
                }}
              />

              <Controller
                control={control}
                name={`fees.${index}.maxInstallments`}
                rules={{
                  min: (watch(`fees.${index}.minInstallments`) || 1) + 1,
                  validate: (value = 0) => {
                    const min = watch(`fees.${index}.minInstallments`) || 1;
                    return (
                      value > min ||
                      `O máximo deve ser maior que o mínimo (${min})`
                    );
                  },
                }}
                render={({ field: f }) => {
                  const min = watch(`fees.${index}.minInstallments`) || 1;

                  return (
                    <NumberInput
                      {...f}
                      label="Máximo de Parcelas"
                      placeholder="12"
                      min={min + 1}
                      onChange={(value) => f.onChange(Number(value))}
                      error={errors.fees?.[index]?.maxInstallments?.message}
                    />
                  );
                }}
              />

              <Controller
                control={control}
                name={`fees.${index}.feePercentage`}
                render={({ field: f }) => (
                  <NumberInput
                    {...f}
                    label={"Percentual (%)"}
                    placeholder="2.99"
                    decimalScale={2}
                    fixedDecimalScale
                    leftSection={<FaPercentage />}
                    error={errors.fees?.[index]?.feePercentage?.message}
                    onChange={(value) => f.onChange(Number(value))}
                  />
                )}
              />

              <Controller
                control={control}
                name={`fees.${index}.receiveInDays`}
                render={({ field: f }) => (
                  <NumberInput
                    {...f}
                    label={"Recebe em (dias)"}
                    placeholder="30"
                    error={errors.fees?.[index]?.receiveInDays?.message}
                    onChange={(value) => f.onChange(Number(value))}
                  />
                )}
              />

              <Checkbox
                label={"Juros ao cliente"}
                {...register(`fees.${index}.customerInterest`)}
                className="col-span-2 md:col-span-3 self-center mt-2"
              />
            </div>
          );
        })}

        {errors.fees?.message && (
          <p className="text-red-500 text-xs mt-1">{errors.fees.message}</p>
        )}
      </div>
      <Button
        type="submit"
        color="#7439FA"
        radius="lg"
        size="md"
        loading={pending}
        className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
      >
        Salvar
      </Button>
    </form>
  );
}
