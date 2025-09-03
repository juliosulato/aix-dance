import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";
import { Loader, Select } from "@mantine/core";
import { CreateBillInput } from "@/schemas/financial/bill.schema";
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';

// Importe os tipos que você precisa do Prisma
import { Student, Supplier, CategoryBill, Bank, PaymentMethod } from "@prisma/client";

type Props = {
    control: Control<CreateBillInput>;
    tenancyId: string;
};

export default function NewBill__Relations({ control, tenancyId }: Props) {
    const t = useTranslations("financial.bills.modals.create");
    const g = useTranslations("general");

    // Hooks para buscar os dados de cada entidade
    const { data: students, isLoading: isLoadingStudents } = useSWR<Student[]>(`/api/v1/tenancies/${tenancyId}/students`, fetcher);
    const { data: suppliers, isLoading: isLoadingSuppliers } = useSWR<Supplier[]>(`/api/v1/tenancies/${tenancyId}/suppliers`, fetcher); // Supondo que a rota /suppliers exista
    const { data: categories, isLoading: isLoadingCategories } = useSWR<CategoryBill[]>(`/api/v1/tenancies/${tenancyId}/category-bills`, fetcher);
    const { data: banks, isLoading: isLoadingBanks } = useSWR<Bank[]>(`/api/v1/tenancies/${tenancyId}/banks`, fetcher);
    const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useSWR<PaymentMethod[]>(`/api/v1/tenancies/${tenancyId}/payment-methods`, fetcher);
    
    const isLoading = isLoadingStudents || isLoadingSuppliers || isLoadingCategories || isLoadingBanks || isLoadingPaymentMethods;

    return (
        <div className="p-4 border border-neutral-300 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-lg font-bold md:col-span-2">{t("relationsSubtitle")}</h2>
            
            {isLoading ? <Loader className="md:col-span-2 mx-auto" /> : (
                <>
                    <Controller
                        name="studentId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t("fields.student.label")}
                                placeholder={t("fields.student.placeholder")}
                                searchable
                                clearable
                                data={students?.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })) || []}
                                nothingFoundMessage={g("notFound")}
                            />
                        )}
                    />
                    <Controller
                        name="supplierId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t("fields.supplier.label")}
                                placeholder={t("fields.supplier.placeholder")}
                                searchable
                                clearable
                                data={suppliers?.map(s => ({ value: s.id, label: s.name })) || []}
                                nothingFoundMessage={g("notFound")}
                            />
                        )}
                    />
                     <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t("fields.category.label")}
                                placeholder={t("fields.category.placeholder")}
                                searchable
                                clearable
                                data={categories?.map(c => ({ value: c.id, label: c.name })) || []}
                                nothingFoundMessage={g("notFound")}
                                className="md:col-span-2"
                            />
                        )}
                    />
                     <Controller
                        name="bankId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t("fields.bank.label")}
                                placeholder={t("fields.bank.placeholder")}
                                searchable
                                clearable
                                data={banks?.map(b => ({ value: b.id, label: b.name })) || []}
                                nothingFoundMessage={g("notFound")}
                            />
                        )}
                    />
                     <Controller
                        name="paymentMethodId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t("fields.paymentMethod.label")}
                                placeholder={t("fields.paymentMethod.placeholder")}
                                searchable
                                clearable
                                data={paymentMethods?.map(p => ({ value: p.id, label: p.name })) || []}
                                nothingFoundMessage={g("notFound")}
                            />
                        )}
                    />
                </>
            )}
        </div>
    );
}
