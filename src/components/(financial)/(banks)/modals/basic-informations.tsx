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
            <h2 className="text-lg font-bold md:col-span-2">{"Informações Básicas"}</h2>

            <TextInput
                label={"Nome"}
                placeholder={"Digite o nome"}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Código do Banco"}
                placeholder={"Digite o código do banco"}
                {...register("code")}
                error={errors.code?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Agência"}
                placeholder={"Digite a agência"}
                {...register("agency")}
                error={errors.agency?.message}
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />

            <TextInput
                label={"Conta"}
                placeholder={"Digite a conta"}
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
                        label={"Taxa de Manutenção"}
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
                        label={"Dia de Vencimento da Taxa de Manutenção"}
                        error={errors.maintenanceFeeDue?.message}
                        classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
                    />
                )}
            />

            <TextInput
                label={"Descrição"}
                {...register("description")}
                error={errors.description?.message}
                className="md:col-span-2"
                classNames={{ input: "!border-transparent !rounded-none !border-b !border-b-neutral-300" }}
            />
        </div>
    );
}

