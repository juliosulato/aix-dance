"use client";

import { Avatar, MultiSelect } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FaSearch } from "react-icons/fa";
import { Student } from "@prisma/client";
import Image from "next/image";
import notFound from "@/assets/images/not-found.avif";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

type Props = {
    control: Control<CreateClassInput | UpdateClassInput>;
    errors: FieldErrors<CreateClassInput | UpdateClassInput>;
    tenancyId: string;
};

export default function Class__Students({ control, errors, tenancyId }: Props) {
    const t = useTranslations("academic.classes.modals.formSteps.two");
    const g = useTranslations("general");

    // --- Busca de dados ---
    const { data: allStudents } = useSWR<Student[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students` : null,
        fetcher
    );

    const studentOptions = allStudents?.map(s => ({
        label: `${s.firstName} ${s.lastName}`,
        value: s.id
    })) || [];

    // --- Assiste aos alunos selecionados no formulário ---
    const selectedStudentIds = useWatch({
        control,
        name: "students",
        defaultValue: []
    });

    const studentsSelected = allStudents?.filter(s => selectedStudentIds?.includes(s.id)) || [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
            <h2 className="text-lg font-bold">{t("title")}</h2>
            
            <Controller
                name="students"
                control={control}
                render={({ field }) => (
                    <MultiSelect
                        label={t("fields.students.label")}
                        placeholder={t("fields.students.placeholder")}
                        data={studentOptions}
                        {...field}
                        searchable
                        className="!w-full"
                        nothingFoundMessage={g("notFound")}
                        rightSection={<FaSearch />}
                        error={errors.students?.message}
                    />
                )}
            />

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-[200px]">
                {studentsSelected.length === 0 ? (
                    <div className="flex flex-col gap-3 items-center justify-center text-center">
                        <Image src={notFound} alt="Nenhum aluno selecionado" className="max-w-[150px]" />
                                    <h3 className="text-xl text-primary font-bold">{t("noStudents.title")}</h3>
                                    <p className="max-w-xs text-neutral-500">{t("noStudents.description")}</p>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentsSelected.map(student => (
                            <div key={student.id} className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg">
                                <Avatar src={student.image} name={`${student.firstName} ${student.lastName}`} radius="xl" />
                                <div>
                                    <p className="font-semibold">{`${student.firstName} ${student.lastName}`}</p>
                                    <p className="text-sm text-neutral-500">{student.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

