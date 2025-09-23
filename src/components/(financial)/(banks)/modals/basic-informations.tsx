import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { CreateBankInput, UpdateBankInput } from "@/schemas/financial/bank.schema";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
dayjs.locale("pt-br")

type Props = {
    control: Control<CreateBankInput | UpdateBankInput>;
    errors: FieldErrors<CreateBankInput | UpdateBankInput>;
    register: UseFormRegister<CreateBankInput | UpdateBankInput>;
};

export default function BankAccount__BasicInformations({ control, errors, register }: Props) {

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{"Texto"}</h2>

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                {...register("code")}
                error={errors.code?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                {...register("agency")}
                error={errors.agency?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                {...register("account")}
                error={errors.account?.message}
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <Controller
                name="maintenanceFeeAmount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        {...field}
                        label={"Texto"}
                        placeholder="0,00"
                        allowDecimal
                        decimalSeparator=","
                        thousandSeparator="."
                        min={1}
                        leftSection={<RiMoneyDollarCircleFill />}
                        error={errors.maintenanceFeeAmount?.message}
                        classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
                    />
                )}
            />

            <Controller
                name="maintenanceFeeDue"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        min={1}
                        max={31}
                        allowDecimal={false}
                        placeholder="5"
                        {...field}
                        label={"Texto"}
                        error={errors.maintenanceFeeDue?.message}
                        classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
                    />
                )}
            />

            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
                {...register("description")}
                error={errors.description?.message}
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />
        </div>
    );
}

