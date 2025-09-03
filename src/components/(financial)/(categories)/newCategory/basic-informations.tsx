import { useTranslations } from "next-intl";
import { Select, TextInput } from "@mantine/core";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateCategoryBillInput } from "@/schemas/financial/category-bill.schema";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { BillCategoryType, BillNature, CategoryBill, CategoryGroup } from "@prisma/client";

type Props = {
    control: Control<CreateCategoryBillInput>;
    errors: FieldErrors<CreateCategoryBillInput>;
    register: UseFormRegister<CreateCategoryBillInput>;
    tenancyId: string;
};

export default function NewCategoryBill__BasicInformations({ control, errors, register, tenancyId }: Props) {
    const t = useTranslations("financial.categoryBills.modals.create");
    const g = useTranslations("general");

    // Busca os grupos de categoria para o seletor
    const { data: groups, isLoading: isLoadingGroups } = useSWR<CategoryGroup[]>(
        tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/category-groups` : null,
        fetcher
    );

    // Busca as categorias existentes para o seletor de "categoria pai"
    const { data: parentCategories, isLoading: isLoadingParents } = useSWR<CategoryBill[]>(
        tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/category-bills` : null,
        fetcher
    );

    return (
        <div className="p-4 border border-neutral-300 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
                label={t("fields.name.label")}
                placeholder={t("fields.name.placeholder")}
                {...register("name")}
                error={errors.name?.message}
                required
                withAsterisk
                className="md:col-span-2"
            />

            <Controller
                name="nature"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.nature.label")}
                        placeholder={t("fields.nature.placeholder")}
                        data={[
                            { label: t('fields.nature.options.REVENUE'), value: BillNature.REVENUE },
                            { label: t('fields.nature.options.EXPENSE'), value: BillNature.EXPENSE },
                        ]}
                        {...field}
                        error={errors.nature?.message}
                        required
                    />
                )}
            />

            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.type.label")}
                        placeholder={t("fields.type.placeholder")}
                        data={[
                            { label: t('fields.type.options.FIXED'), value: BillCategoryType.FIXED },
                            { label: t('fields.type.options.VARIABLE'), value: BillCategoryType.VARIABLE },
                        ]}
                        {...field}
                        error={errors.type?.message}
                        required
                    />
                )}
            />

            <Controller
                name="groupId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.group.label")}
                        placeholder={t("fields.group.placeholder")}
                        data={groups?.map(g => ({ label: g.name, value: g.id })) || []}
                        {...field}
                        error={errors.groupId?.message}
                        searchable
                        clearable
                        nothingFoundMessage={g("notFound")}
                        disabled={isLoadingGroups}
                        className="md:col-span-2"
                    />
                )}
            />

            <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.parent.label")}
                        placeholder={t("fields.parent.placeholder")}
                        data={parentCategories?.map(p => ({ label: p.name, value: p.id })) || []}
                        {...field}
                        error={errors.parentId?.message}
                        searchable
                        clearable
                        nothingFoundMessage={g("notFound")}
                        disabled={isLoadingParents}
                        className="md:col-span-2"
                    />
                )}
            />
        </div>
    );
}
