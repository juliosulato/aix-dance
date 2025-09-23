import { Select, TextInput } from "@mantine/core";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateCategoryBillInput, UpdateCategoryBillInput } from "@/schemas/financial/category-bill.schema";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { BillCategoryType, BillNature, CategoryBill, CategoryGroup } from "@prisma/client";

type Props = {
    control: Control<CreateCategoryBillInput | UpdateCategoryBillInput>;
    errors: FieldErrors<CreateCategoryBillInput | UpdateCategoryBillInput>;
    register: UseFormRegister<CreateCategoryBillInput | UpdateCategoryBillInput>;
    tenancyId: string;
};

export default function Category__BasicInformations({ control, errors, register, tenancyId }: Props) {

    const { data: groups, isLoading: isLoadingGroups } = useSWR<CategoryGroup[]>(
        tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/category-groups` : null,
        fetcher
    );

    const { data: parentCategories, isLoading: isLoadingParents } = useSWR<CategoryBill[]>(
        tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/category-bills` : null,
        fetcher
    );

    return (
        <div className="rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
                label={"Texto"}
                placeholder={"Texto"}
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
                        label={"Texto"}
                        placeholder={"Texto"}
                        data={[
                            { label: t('fields.nature.enums.revenue'), value: BillNature.REVENUE },
                            { label: t('fields.nature.enums.expense'), value: BillNature.EXPENSE },
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
                        label={"Texto"}
                        placeholder={"Texto"}
                        data={[
                            { label: t('fields.type.enums.fixed'), value: BillCategoryType.FIXED },
                            { label: t('fields.type.enums.variable'), value: BillCategoryType.VARIABLE },
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
                        label={"Texto"}
                        placeholder={"Texto"}
                        data={groups?.map(g => ({ label: g.name, value: g.id })) || []}
                        {...field}
                        error={errors.groupId?.message}
                        searchable
                        clearable
                        nothingFoundMessage={"Nada encontrado..."}
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
                        label={"Texto"}
                        placeholder={"Texto"}
                        data={parentCategories?.map(p => ({ label: p.name, value: p.id })) || []}
                        {...field}
                        error={errors.parentId?.message}
                        searchable
                        clearable
                        nothingFoundMessage={"Nada encontrado..."}
                        disabled={isLoadingParents}
                        className="md:col-span-2"
                    />
                )}
            />
        </div>
    );
}
