"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { Control, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Modality, Student, User } from "@prisma/client";
import { CreateClassInput } from "@/schemas/academic/class.schema";

type Props = {
    control: Control<CreateClassInput>;
    tenancyId: string;
};

// Componente para exibir os horários de forma limpa
const ScheduleSummary = ({ schedules, t }: { schedules: CreateClassInput['schedules'], t: any }) => {
    const activeDays = Object.entries(schedules)
        .filter(([, day]) => day.enabled && day.ranges.some(r => r.from && r.to))
        .map(([dayKey, dayValue]) => ({
            day: t(`academic.classes.modals.formSteps.one.classDaysAndHours.days.${dayKey}`),
            ranges: dayValue.ranges.filter(r => r.from && r.to).map(r => `${r.from} - ${r.to}`).join(', ')
        }));

    if (activeDays.length === 0) {
        return <InfoTerm label={"Texto"} children={"Nenhum horário definido"} />;
    }

    return (
        <>
            <h3 className="text-lg font-bold md:col-span-full text-primary">{"Texto"}</h3>
            {activeDays.map(dayInfo => (
                <InfoTerm key={dayInfo.day} label={dayInfo.day} children={dayInfo.ranges} />
            ))}
        </>
    );
};


export default function NewClass__Resume({ control, tenancyId }: Props) {

    // useWatch para observar todos os valores do formulário em tempo real
    const watchedValues = useWatch({ control });

    // Busca de dados para "traduzir" IDs em nomes
    const { data: modalities } = useSWR<Modality[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/modalities`, fetcher);
    const { data: teachers } = useSWR<User[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users?role=TEACHER`, fetcher);
    const { data: students } = useSWR<Student[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students`, fetcher);

    const modalityName = modalities?.find(m => m.id === watchedValues.modalityId)?.name || '...';
    const teacherName = teachers?.find(t => t.id === watchedValues.teacherId)?.firstName || '...';
    const assistantName = teachers?.find(t => t.id === watchedValues.assistantId)?.firstName;
    const selectedStudentsNames = students
        ?.filter(s => watchedValues.students?.includes(s.id))
        .map(s => `${s.firstName} ${s.lastName}`)
        .join(', ');

    return (
        <div className="mt-4 flex flex-col gap-4 w-full ">
            <h2 className="text-lg font-bold">{"Texto"}</h2>
            
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <h3 className="text-lg font-bold md:col-span-full text-primary">{"Texto"}</h3>
                <InfoTerm label={"Texto"} children={watchedValues.name} />
                <InfoTerm label={"Texto"} children={modalityName} />
                <InfoTerm label={"Texto"} children={teacherName} />
                {assistantName && <InfoTerm label={"Texto"} children={assistantName} />}
                <InfoTerm label={"Texto"} children={watchedValues.online ? "Texto" : "Texto"} />

                <div className="md:col-span-full"><hr className="my-2"/></div>

                {watchedValues.schedules && <ScheduleSummary schedules={watchedValues.schedules as any} t={t} />}
            </div>

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
                <h3 className="text-lg font-bold text-primary">{"Texto"}</h3>
                <InfoTerm 
                    label={"Texto"} 
                    children={selectedStudentsNames || "Nenhum aluno selecionado"} 
                />
            </div>
        </div>
    );
}

