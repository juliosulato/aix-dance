"use client";

import { Avatar, MultiSelect } from "@mantine/core";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import notFound from "@/assets/images/not-found.avif";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { StudentFromApi } from "../../(students)/StudentFromApi";

type Props = {
    control: Control<CreateClassInput | UpdateClassInput>;
    errors: FieldErrors<CreateClassInput | UpdateClassInput>;
    tenancyId: string;
};

export default function Class__Students({ control, errors, tenancyId }: Props) {
    const { data: allStudents } = useSWR<StudentFromApi[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students` : null,
        fetcher
    );

    const studentOptions = allStudents?.filter((student: StudentFromApi) => {
        // 1. Verificar se o aluno está ativo
        if (!student?.active) {
            console.log(`${student.firstName} não está ativo`);
            return false;
        }

        // 2. Verificar se o aluno tem um plano ativo com frequency
        const plan = student?.subscriptions?.[0]?.plan;
        if (!plan?.frequency) {
            console.log(`${student.firstName} não tem plano com frequência definida`);
            return false;
        }

        // 3. Verificar quantas classes ativas o aluno tem
        const activeClasses = student?.classes?.filter((cls: any) => cls.status === "ACTIVE") || [];
        const activeClassesCount = activeClasses.length;
        
        // Log detalhado para debug
        console.log({
            student: student.firstName,
            planFrequency: plan.frequency,
            activeClassesCount,
            classes: activeClasses.map((c: any) => c.class?.name || c.classId),
            shouldShow: activeClassesCount < plan.frequency
        });
        
        // Verificação mais explícita
        const hasVacancy = activeClassesCount < plan.frequency;
        return hasVacancy;
    })?.map((s: StudentFromApi) => {
        const activeCount = s.classes?.filter((cls: any) => cls.status === "ACTIVE").length || 0;
        const planFreq = s.subscriptions?.[0]?.plan?.frequency || 0;
        
        return {
            label: `${s.firstName ?? ""} ${s.lastName ?? ""} (${activeCount}/${planFreq} aulas)`,
            value: s.id
        };
    }) || [];

    const selectedStudentIds = useWatch({
        control,
        name: "students",
        defaultValue: []
    });

    const studentsSelected = allStudents?.filter(s => selectedStudentIds?.includes(s.id)) || [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
            <h2 className="text-lg font-bold">{"Texto"}</h2>
            <Controller
                name="students"
                control={control}
                render={({ field }) => (
                    <MultiSelect
                        label={"Texto"}
                        placeholder={"Texto"}
                        data={studentOptions}
                        {...field}
                        searchable
                        className="!w-full"
                        nothingFoundMessage={"Nada encontrado..."}
                        rightSection={<FaSearch />}
                        error={errors.students?.message}
                    />
                )}
            />

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-[200px]">
                {studentsSelected.length === 0 ? (
                    <div className="flex flex-col gap-3 items-center justify-center text-center">
                        <Image src={notFound} alt="Nenhum aluno selecionado" className="max-w-[150px]" />
                        <h3 className="text-xl text-primary font-bold">{"Texto"}</h3>
                        <p className="max-w-xs text-neutral-500">{"Texto"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentsSelected.map(student => {
                            const activeCount = student.classes?.filter((cls: any) => cls.status === "ACTIVE").length || 0;
                            const planFreq = student.subscriptions?.[0]?.plan?.frequency || 0;
                            
                            return (
                                <div key={student.id} className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg">
                                    <Avatar src={student.image} name={`${student.firstName} ${student.lastName}`} radius="xl" />
                                    <div>
                                        <p className="font-semibold">{`${student.firstName} ${student.lastName}`}</p>
                                        <p className="text-sm text-neutral-500">{student.email}</p>
                                        <p className="text-xs text-green-600">
                                            {planFreq 
                                                ? `Plano: ${activeCount}/${planFreq} aulas`
                                                : "Sem plano ativo"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}