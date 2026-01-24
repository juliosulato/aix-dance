"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { Control, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { extractItemsFromResponse, PaginatedListResponse } from "@/utils/pagination";
import { CreateClassInput } from "@/schemas/academic/class.schema";
import { Modality } from "@/types/class.types";
import { Student } from "@/types/student.types";
import { User } from "@/types/user.types";
type Props = {
    control: Control<CreateClassInput>;
    tenantId: string;
};

// Componente para exibir os horários de forma limpa
const ScheduleSummary = ({ schedules }: { schedules: CreateClassInput['schedules'] }) => {
    const dayNames = {
        sunday: 'Domingo',
        monday: 'Segunda-feira', 
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado'
    };
    
    const activeDays = Object.entries(schedules)
        .filter(([, day]) => day.enabled && day.ranges.some(r => r.from && r.to))
        .map(([dayKey, dayValue]) => ({
            day: dayNames[dayKey as keyof typeof dayNames],
            ranges: dayValue.ranges.filter(r => r.from && r.to).map(r => `${r.from} - ${r.to}`).join(', ')
        }));

    if (activeDays.length === 0) {
        return <InfoTerm label="Horários">Nenhum horário definido</InfoTerm>;
    }

    return (
        <>
            <h3 className="text-lg font-bold md:col-span-full text-primary">Horários da Turma</h3>
            {activeDays.map(dayInfo => (
                <InfoTerm key={dayInfo.day} label={dayInfo.day}>{dayInfo.ranges}</InfoTerm>
            ))}
        </>
    );
};


export default function NewClass__Resume({ control, tenantId }: Props) {

    // useWatch para observar todos os valores do formulário em tempo real
    const watchedValues = useWatch({ control });

    // Busca de dados para "traduzir" IDs em nomes
    const { data: modalities } = useSWR<Modality[]>(`/api/v1/tenants/${tenantId}/modalities`, fetcher);
    const { data: teachers } = useSWR<User[]>(`/api/v1/tenants/${tenantId}/users?role=TEACHER`, fetcher);
    const { data: studentsResponse } = useSWR<Student[] | PaginatedListResponse<Student>>(`/api/v1/tenants/${tenantId}/students?limit=500`, fetcher);
    const students = extractItemsFromResponse(studentsResponse);

    const modalityName = modalities?.find(m => m.id === watchedValues.modalityId)?.name || '...';
    const teacherName = teachers?.find(t => t.id === watchedValues.teacherId)?.firstName || '...';
    const assistantName = teachers?.find(t => t.id === watchedValues.assistantId)?.firstName;
    const selectedStudentsNames = students
        ?.filter(s => watchedValues.students?.includes(s.id))
        .map(s => `${s.firstName} ${s.lastName}`)
        .join(', ');

    return (
        <div className="mt-4 flex flex-col gap-4 w-full ">
            <h2 className="text-lg font-bold">{"Resumo da Turma"}</h2>
            
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <h3 className="text-lg font-bold md:col-span-full text-primary">{"Informações"}</h3>
                <InfoTerm label={"Nome"}>{watchedValues.name}</InfoTerm>
                <InfoTerm label={"Modalidade"}>{modalityName}</InfoTerm>
                <InfoTerm label={"Professor"}>{teacherName}</InfoTerm>
                {assistantName && <InfoTerm label={"Assistente"}>{assistantName}</InfoTerm>}
                <InfoTerm label={"Online"}>{watchedValues.online ? "Sim" : "Não"}</InfoTerm>

                <div className="md:col-span-full"><hr className="my-2"/></div>

                {watchedValues.schedules && <ScheduleSummary schedules={watchedValues.schedules as any} />}
            </div>

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
                <h3 className="text-lg font-bold text-primary">{"Alunos Selecionados"}</h3>
                <InfoTerm 
                    label={"Alunos"} 
                >
                    {selectedStudentsNames || "Nenhum aluno selecionado"}
                </InfoTerm>
            </div>
        </div>
    );
}

