"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { Control, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import {
  extractItemsFromResponse,
  PaginatedListResponse,
} from "@/utils/pagination";
import { CreateClassInput, DAYS_OF_WEEK, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Modality } from "@/types/class.types";
import { Student } from "@/types/student.types";
import { User } from "@/types/user.types";

type Props = {
  control: Control<CreateClassInput | UpdateClassInput>;
  tenantId: string;
};

const DAY_NAMES: Record<DAYS_OF_WEEK, string> = {
  [DAYS_OF_WEEK.SUNDAY]: "Domingo",
  [DAYS_OF_WEEK.MONDAY]: "Segunda-feira",
  [DAYS_OF_WEEK.TUESDAY]: "Terça-feira",
  [DAYS_OF_WEEK.WEDNESDAY]: "Quarta-feira",
  [DAYS_OF_WEEK.THURSDAY]: "Quinta-feira",
  [DAYS_OF_WEEK.FRIDAY]: "Sexta-feira",
  [DAYS_OF_WEEK.SATURDAY]: "Sábado",
};

/**
 * ScheduleSummary Component
 * Displays schedule information in a readable format
 */
type ScheduleSummaryProps = {
  days: Array<{
    dayOfWeek: DAYS_OF_WEEK;
    initialHour: string;
    endHour: string;
  }>;
};

function ScheduleSummary({ days }: ScheduleSummaryProps) {
  if (!days || days.length === 0) {
    return <InfoTerm label="Horários">Nenhum horário definido</InfoTerm>;
  }

  // Group schedules by day
  const groupedByDay = days.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<DAYS_OF_WEEK, typeof days>);

  const activeDays = Object.entries(groupedByDay).map(([dayKey, schedules]) => ({
    day: DAY_NAMES[dayKey as DAYS_OF_WEEK],
    ranges: schedules
      .map((s) => `${s.initialHour} - ${s.endHour}`)
      .join(", "),
  }));

  return (
    <>
      <h3 className="text-lg font-bold md:col-span-full text-primary">
        Horários da Turma
      </h3>
      {activeDays.map((dayInfo) => (
        <InfoTerm key={dayInfo.day} label={dayInfo.day}>
          {dayInfo.ranges}
        </InfoTerm>
      ))}
    </>
  );
}

/**
 * ClassSummary Component
 * Displays a comprehensive summary of class information before submission
 * Follows SRP by only handling data display
 */
export default function ClassSummary({ control, tenantId }: Props) {
  // Watch all form values
  const watchedValues = useWatch({ control });

  // Fetch data to translate IDs to names
  const { data: modalities } = useSWR<Modality[]>(
    `/api/v1/tenants/${tenantId}/academic/modalities`,
    fetcher
  );

  const { data: teachers } = useSWR<User[]>(
    `/api/v1/tenants/${tenantId}/users?role=TEACHER`,
    fetcher
  );

  const { data: studentsResponse } = useSWR<
    Student[] | PaginatedListResponse<Student>
  >(`/api/v1/tenants/${tenantId}/academic/students?limit=500`, fetcher);

  const students = extractItemsFromResponse(studentsResponse);

  // Find names from IDs
  const modalityName =
    modalities?.find((m) => m.id === watchedValues.modalityId)?.name || "...";

  const teacherName =
    teachers?.find((t) => t.id === watchedValues.teacherId)?.firstName || "...";

  const assistantName = watchedValues.assistantId
    ? teachers?.find((t) => t.id === watchedValues.assistantId)?.firstName
    : undefined;

  const selectedStudentsNames = students
    ?.filter((s) => watchedValues.students?.includes(s.id))
    .map((s) => `${s.firstName} ${s.lastName}`)
    .join(", ");

  return (
    <div className="mt-4 flex flex-col gap-4 w-full">
      <h2 className="text-lg font-bold">Resumo da Turma</h2>

      {/* Class Information */}
      <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <h3 className="text-lg font-bold md:col-span-full text-primary">
          Informações
        </h3>

        <InfoTerm label="Nome">{watchedValues.name}</InfoTerm>
        <InfoTerm label="Modalidade">{modalityName}</InfoTerm>
        <InfoTerm label="Professor">{teacherName}</InfoTerm>

        {assistantName && (
          <InfoTerm label="Assistente">{assistantName}</InfoTerm>
        )}

        <InfoTerm label="Online">
          {watchedValues.online ? "Sim" : "Não"}
        </InfoTerm>

        <div className="md:col-span-full">
          <hr className="my-2" />
        </div>

        {/* Schedule Information */}
        {watchedValues.days && watchedValues.days.length > 0 && (
          <ScheduleSummary days={watchedValues.days as any} />
        )}
      </div>

      {/* Students Information */}
      <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-primary">
          Alunos Selecionados
        </h3>
        <InfoTerm label="Alunos">
          {selectedStudentsNames || "Nenhum aluno selecionado"}
        </InfoTerm>
      </div>
    </div>
  );
}
