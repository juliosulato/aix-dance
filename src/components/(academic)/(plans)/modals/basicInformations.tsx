import { LoadingOverlay, NumberInput, Select, TextInput } from "@mantine/core";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { ContractModel, PlanType } from "@prisma/client";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("academic.plans.modals.basicInformations");
    const g = useTranslations("");

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
        notifications.show({ title: g("general.errors.title"), message: g("general.errors.contract-models"), color: "red" })
    }


    const contractModelsIds =
        contracts?.map((contract) => ({
            title: contract.title,
            id: contract.id,
        })) ?? [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>

            <TextInput
                label={t("fields.name.label")}
                placeholder={t("fields.name.placeholder")}
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
                        label={t("fields.frequency.label")}
                        placeholder={t("fields.frequency.placeholder")}
                        min={1}
                        allowDecimal={false}
                        suffix={t("fields.frequency.suffix")}
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
                        label={t("fields.amount.label")}
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
                        label={t("fields.cicle.label")}
                        placeholder={t("fields.cicle.placeholder")}
                        required
                        data={[
                            { label: t("fields.cicle.planTypes.SEMMONTLY"), value: PlanType.SEMMONTLY },
                            { label: t("fields.cicle.planTypes.MONTHLY"), value: PlanType.MONTHLY },
                            { label: t("fields.cicle.planTypes.BI_MONTHLY"), value: PlanType.BI_MONTHLY },
                            { label: t("fields.cicle.planTypes.QUARTERLY"), value: PlanType.QUARTERLY },
                            { label: t("fields.cicle.planTypes.BI_ANNUAL"), value: PlanType.BI_ANNUAL },
                            { label: t("fields.cicle.planTypes.ANNUAL"), value: PlanType.ANNUAL },
                        ]}
                        classNames={{ dropdown: "!z-[1000]" }}
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                        value={field.value}
                        onChange={field.onChange}
                        clearable
                    />
                )}
            />


            <Controller
                name="contractModelId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.contractModel.label")}
                        id="contractModelId"
                        name="contractModelId"
                        placeholder={t("fields.contractModel.placeholder")}
                        value={field.value}
                        searchable
                        data={contractModelsIds.map((c) => ({
                            label: c.title,
                            value: c.id
                        }))}
                        nothingFoundMessage={g("general.boolean.notFound")}
                        onChange={field.onChange}
                        clearable
                        key={field.value || 'empty'} // <--- Adicione esta linha!
                        className="md:col-span-2 lg:col-span-3 3xl:col-span-4"
                    />
                )}
            />
        </div>
    )
}