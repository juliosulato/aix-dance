"use client";

import { Checkbox, Select, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Control, Controller, FieldErrors } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Modality, User } from "@prisma/client";

type Props = {
    control: Control<CreateClassInput | UpdateClassInput>;
    errors: FieldErrors<CreateClassInput | UpdateClassInput>;
    tenancyId: string;
};

export default function NewClass__AboutOfClass({ control, errors, tenancyId }: Props) {
    const t = useTranslations("academic.classes.modals.formSteps.one");
    const g = useTranslations("");

    // --- Busca de dados para os selects ---
    const { data: modalities } = useSWR<Modality[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/modalities` : null,
        fetcher
    );
    const { data: teachers } = useSWR<User[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users?role=TEACHER` : null,
        fetcher
    );

    const modalityOptions = modalities?.map((m) => ({ label: m.name, value: m.id })) || [];
    const teacherOptions = teachers?.map((t) => ({ label: `${t.firstName} ${t.lastName}`, value: t.id })) || [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <h2 className="text-lg font-bold md:col-span-full">{t("title")}</h2>
            
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <TextInput
                        label={t("fields.name.label")}
                        placeholder={t("fields.name.placeholder")}
                        {...field}
                        error={errors.name?.message}
                        required
                    />
                )}
            />

            <Controller
                name="modalityId"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1">
                        <Select
                            label={t("fields.modality.label")}
                            placeholder={t("fields.modality.placeholder")}
                            data={modalityOptions}
                            {...field}
                            error={errors.modalityId?.message}
                            required
                            searchable
                            nothingFoundMessage={g("general.notFound")}
                        />
                        <p className="text-xs text-neutral-500">{t("fields.modality.description")} <Link className="text-primary underline" href={"/system/academic/modalities"}>{g("appShell.navbar.academic.modalities")}</Link></p>
                    </div>
                )}
            />

            <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.teacher.label")}
                        placeholder={t("fields.teacher.placeholder")}
                        data={teacherOptions}
                        {...field}
                        error={errors.teacherId?.message}
                        required
                        searchable
                        nothingFoundMessage={g("general.notFound")}
                    />
                )}
            />

            <Controller
                name="assistantId"
                control={control}
                render={({ field }) => (
                    <Select
                        label={t("fields.assistant.label")}
                        placeholder={t("fields.assistant.placeholder")}
                        data={teacherOptions}
                        {...field}
                        error={errors.assistantId?.message}
                        searchable
                        clearable
                        nothingFoundMessage={g("general.boolean.notFound")}
                    />
                )}
            />
            
            <Controller
                name="online"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value || false}
                        onChange={(event) => field.onChange(event.currentTarget.checked)}
                        label={t("fields.online.label")}
                        className="md:col-span-full mt-4"
                    />
                )}
            />
        </div>
    );
}

