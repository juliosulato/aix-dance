"use client";

import { Avatar, MultiSelect } from "@mantine/core";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import notFound from "@/assets/images/not-found.png";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import {
  extractItemsFromResponse,
  PaginatedListResponse,
} from "@/utils/pagination";
import { StudentComplete } from "@/types/student.types";

type Props = {
  control: Control<CreateClassInput | UpdateClassInput>;
  errors: FieldErrors<CreateClassInput | UpdateClassInput>;
  tenantId: string;
};

/**
 * Check if student can be added to more classes
 */
const isStudentEligible = (student: StudentComplete): boolean => {
  // 1. Check if student is active
  if (!student?.active) {
    return false;
  }

  // 2. Check if student has an active plan with frequency
  const plan = student?.subscriptions?.[0]?.plan;
  if (!plan?.frequency) {
    return false;
  }

  // 3. Check if student has vacancy in their plan
  const activeClasses =
    student?.classes?.filter((cls: any) => cls.status === "ACTIVE") || [];
  const activeClassesCount = activeClasses.length;

  return activeClassesCount < plan.frequency;
};

/**
 * Transform student to select option
 */
const transformStudentToOption = (student: StudentComplete) => {
  const activeCount =
    student.classes?.filter((cls: any) => cls.status === "ACTIVE").length || 0;
  const planFreq = student.subscriptions?.[0]?.plan?.frequency || 0;

  return {
    label: `${student.firstName ?? ""} ${student.lastName ?? ""} (${activeCount}/${planFreq} aulas)`,
    value: student.id,
  };
};

/**
 * ClassStudents Component
 * Manages student selection for a class
 * Follows SRP by only handling student management
 */
export default function ClassStudents({ control, errors, tenantId }: Props) {
  // Fetch students
  const { data: studentsResponse, isLoading } = useSWR<
    StudentComplete[] | PaginatedListResponse<StudentComplete>
  >(
    tenantId
      ? `/api/v1/tenants/${tenantId}/academic/students?limit=500`
      : null,
    fetcher
  );

  const allStudents = extractItemsFromResponse(studentsResponse);

  // Filter eligible students and transform to options
  const studentOptions =
    allStudents?.filter(isStudentEligible).map(transformStudentToOption) || [];

  // Watch selected student IDs
  const selectedStudentIds = useWatch({
    control,
    name: "students",
    defaultValue: [],
  });

  // Get full student data for selected students
  const studentsSelected =
    allStudents?.filter((s) => selectedStudentIds?.includes(s.id)) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
      <h2 className="text-lg font-bold">Alunos</h2>

      <Controller
        name="students"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Alunos"
            placeholder="Selecione os alunos"
            data={studentOptions}
            {...field}
            searchable
            className="w-full!"
            nothingFoundMessage="Nada encontrado..."
            rightSection={<FaSearch />}
            error={errors.students?.message}
            disabled={isLoading}
          />
        )}
      />

      <SelectedStudentsList students={studentsSelected} />
    </div>
  );
}

/**
 * SelectedStudentsList Component
 * Displays list of selected students
 * Separated for better readability
 */
type SelectedStudentsListProps = {
  students: StudentComplete[];
};

function SelectedStudentsList({ students }: SelectedStudentsListProps) {
  if (students.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-50">
        <div className="flex flex-col gap-3 items-center justify-center text-center">
          <Image
            src={notFound}
            alt="Nenhum aluno selecionado"
            className="max-w-37.5"
          />
          <h3 className="text-xl text-primary font-bold">
            Ooops... você ainda não selecionou nenhum aluno
          </h3>
          <p className="max-w-xs text-neutral-500">
            Selecione alunos para continuar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}

/**
 * StudentCard Component
 * Displays individual student information
 * Separated for better organization
 */
type StudentCardProps = {
  student: StudentComplete;
};

function StudentCard({ student }: StudentCardProps) {
  const activeCount =
    student.classes?.filter((cls: any) => cls.status === "ACTIVE").length || 0;
  const planFreq = student.subscriptions?.[0]?.plan?.frequency || 0;

  return (
    <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg">
      <Avatar
        src={student.image}
        name={`${student.firstName} ${student.lastName}`}
        radius="xl"
      />
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
}
