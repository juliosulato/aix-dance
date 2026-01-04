import {
  CreateBillInput,
  UpdateBillInput,
} from "@/schemas/financial/bill.schema";
import { NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

type Props = {
  register: UseFormRegister<CreateBillInput | UpdateBillInput>;
  control: Control<CreateBillInput | UpdateBillInput>;
  errors: FieldErrors<CreateBillInput | UpdateBillInput>;
};

export default function Installments({ control, errors }: Props) {
  return (
    <div className="form-card-grid">
      <Controller
        control={control}
        name="installments"
        defaultValue={1}
        render={({ field }) => (
          <NumberInput
            label={"Parcelas"}
            suffix={" parcelas"}
            value={field.value || 1}
            onChange={(val) => {
              const newValue = Number(val) || 1;
              field.onChange(newValue);
            }}
            min={2}
            max={24}
            error={(errors as any)?.installments?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="dueDate"
        render={({ field }) => (
          <DateInput
            {...field}
            label={"Vencimento da 1ª Parcela"}
            locale={"pt-BR"}
            value={field.value}
            error={(errors as any)?.dueDate?.message}
            required
          />
        )}
      />

    </div>
  );
}