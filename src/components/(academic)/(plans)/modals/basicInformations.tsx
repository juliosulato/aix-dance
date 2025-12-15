import { LoadingOverlay, NumberInput, Select, TextInput } from "@mantine/core";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { ContractModel, PlanType } from "@prisma/client";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { notifications } from "@mantine/notifications";
import { UpdatePlanInput, CreatePlanInput } from "@/schemas/academic/plan";

type Props = {
    control: Control<CreatePlanInput | UpdatePlanInput>;
    errors: FieldErrors<CreatePlanInput | UpdatePlanInput>;
    register: UseFormRegister<CreatePlanInput | UpdatePlanInput>;
    tenancyId: string;
};

export default function Plan__BasicInformations({ control, errors, register, tenancyId }: Props) {


    const { data: contracts, error, isLoading } = useSWR<ContractModel[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/contract-models`,
        fetcher
    );

    if (isLoading) {
        return (
            <LoadingOverlay
                visible
                zIndex={9999}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'violet', type: 'dots' }}
                pos="fixed"
                h="100vh"
                w="100vw"
            />
        );
    }

    
    if (error) {
        console.error(error);
        notifications.show({ title: "Erro", message: "Falha ao carregar modelos de contrato.", color: "red" })
    }


    const contractModelsIds =
        contracts?.map((contract) => ({
            title: contract.title,
            id: contract.id,
        })) ?? [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{"Informações Básicas"}</h2>

            <TextInput
                label={"Nome do Plano"}
                placeholder={"Digite o nome do plano"}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
            />

            <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        label={"Frequência"}
                        placeholder={"Quantas parcelas"}
                        min={1}
                        allowDecimal={false}
                        suffix={"x"}
                        required
                        withAsterisk
                        value={field.value}
                        onChange={(val) => field.onChange(val ?? 1)}
                    />
                )}
            />

            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <NumberInput
                        label={"Valor (R$)"}
                        allowDecimal
                        decimalSeparator=","
                        required
                        min={0}
                        withAsterisk
                        value={field.value}
                        onChange={(val) => field.onChange(val ?? 0)}
                        leftSection={<RiMoneyDollarCircleFill />}
                    />
                )}
            />

            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select
                        label={"Tipo de Ciclo"}
                        placeholder={"Selecione o tipo de ciclo"}
                        required
                        data={[
                            { label: "Quinzenal", value: PlanType.SEMMONTLY },
                            { label: "Mensal", value: PlanType.MONTHLY },
                            { label: "Bimestral", value: PlanType.BI_MONTHLY },
                            { label: "Trimestral", value: PlanType.QUARTERLY },
                            { label: "Semestral", value: PlanType.BI_ANNUAL },
                            { label: "Anual", value: PlanType.ANNUAL },
                        ]}
                        classNames={{ dropdown: "!z-[1000]" }}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        value={field.value}
                        onChange={field.onChange}
                        clearable
                    />
                )}
            />


           
        </div>
    )
}