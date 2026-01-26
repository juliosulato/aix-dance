import { useEffect, useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "@/utils/fetcher";
import {
  extractItemsFromResponse,
  PaginatedListResponse,
} from "@/utils/pagination";
import {
  EnrollStudentsInput,
  enrollStudentsSchema,
} from "@/schemas/academic/class.schema";
import { Student, StudentClass, StudentComplete } from "@/types/student.types";
import { Class, Modality } from "@/types/class.types";
import { User } from "@/types/user.types";
import { archiveStudentClass, enrollStudents } from "@/actions/academic/student-classes.actions";

interface ClassFromApi extends Class {
  modality: Modality;
  teacher: User;
  assistant: User | null;
  studentClasses: (StudentClass & {
    student: Student;
  })[];
}

interface StudentClassWithStudent extends StudentClass {
  student: Student;
}

interface ClassData extends ClassFromApi {
  days: any[];
  studentClasses: StudentClassWithStudent[];
}

interface UseAssignStudentsProps {
  classData: ClassData | null;
  mutate: KeyedMutator<any>;
  onClose: () => void;
}

export function useAssignStudents({
  classData,
  mutate,
  onClose,
}: UseAssignStudentsProps) {
  const [isPending, startTransition] = useTransition();
  const { data: sessionData, isPending: isSessionPending } = useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EnrollStudentsInput>({
    resolver: zodResolver(enrollStudentsSchema),
    defaultValues: { studentIds: [] },
  });

  // Matrículas ativas da turma
  const activeEnrollments = useMemo(
    () =>
      classData?.studentClasses?.filter((e) => e.status === "ACTIVE") || [],
    [classData?.studentClasses]
  );

  // Busca todos os alunos disponíveis
  const { data: studentsResponse } = useSWR<
    StudentComplete[] | PaginatedListResponse<StudentComplete>
  >(
    () =>
      sessionData?.user.tenantId
        ? `/api/v1/tenancies/${sessionData.user.tenantId}/students?limit=500`
        : null,
    fetcher
  );

  const allStudents = useMemo(
    () => extractItemsFromResponse(studentsResponse),
    [studentsResponse]
  );

  // Opções do MultiSelect
  const studentOptions = useMemo(() => {
    const optionsMap = new Map<string, { label: string; value: string }>();

    if (activeEnrollments) {
      activeEnrollments.forEach((enrollment) => {
        const student = enrollment.student;
        if (student) {
          optionsMap.set(student.id, {
            label: `${student.firstName} ${student.lastName}`,
            value: student.id,
          });
        }
      });
    }

    if (allStudents) {
      allStudents.forEach((student) => {
        optionsMap.set(student.id, {
          label: `${student.firstName} ${student.lastName}`,
          value: student.id,
        });
      });
    }

    return Array.from(optionsMap.values());
  }, [allStudents, activeEnrollments]);

  // Sincroniza form com matrículas existentes
  useEffect(() => {
    if (classData && classData.studentClasses) {
      const currentStudentIds = activeEnrollments.map(
        (enrollment) => enrollment.student.id
      );
      reset({ studentIds: currentStudentIds });
    }
  }, [classData, activeEnrollments, reset]);

  const selectedStudentIds = useWatch({
    control,
    name: "studentIds",
    defaultValue: [],
  });

  // Mapa de estudantes para lookup rápido
  const studentsMap = useMemo(() => {
    const map = new Map<string, Student>();
    if (activeEnrollments) {
      activeEnrollments.forEach((enrollment) =>
        map.set(enrollment.student.id, enrollment.student)
      );
    }
    if (allStudents) {
      allStudents.forEach((student) => map.set(student.id, student));
    }
    return map;
  }, [allStudents, activeEnrollments]);

  // Estudantes selecionados no formulário
  const studentsSelected = useMemo(() => {
    return (selectedStudentIds || [])
      .map((id) => studentsMap.get(id))
      .filter((student): student is Student => !!student);
  }, [selectedStudentIds, studentsMap]);

  // Handler de submit
  const handleAssignStudents = async (data: EnrollStudentsInput) => {
    if (!sessionData?.user || !classData?.id) {
      notifications.show({
        message: "Sessão não autenticada ou turma inválida",
        color: "red",
      });
      return;
    }

    const initialStudentIds = activeEnrollments.map(
      (e: StudentClassWithStudent) => e.student.id
    );
    const finalStudentIds = data.studentIds || [];

    const studentsToEnroll = finalStudentIds.filter(
      (id) => !initialStudentIds.includes(id)
    );

    const enrollmentsToArchive = activeEnrollments.filter(
      (enrollment: StudentClassWithStudent) =>
        !finalStudentIds.includes(enrollment.student.id)
    );

    if (studentsToEnroll.length === 0 && enrollmentsToArchive.length === 0) {
      notifications.show({
        message: "Nenhuma alteração foi realizada",
        color: "yellow",
      });
      handleClose();
      return;
    }

    startTransition(async () => {
      try {
        const promises: Promise<any>[] = [];

        if (studentsToEnroll.length > 0) {
          promises.push(
            enrollStudents(classData.id, { studentIds: studentsToEnroll })
          );
        }

        if (enrollmentsToArchive.length > 0) {
          enrollmentsToArchive.forEach((enrollment: StudentClassWithStudent) => {
            promises.push(
              archiveStudentClass({ studentClassId: enrollment.id })
            );
          });
        }

        const results = await Promise.all(promises);
        const hasError = results.some((result) => !result.success);

        if (hasError) {
          const errorResult = results.find((result) => !result.success);
          throw new Error(errorResult?.error || "Erro ao processar operações");
        }

        notifications.show({
          message: "Estudantes atribuídos com sucesso",
          color: "green",
        });

        await mutate();
        handleClose();
      } catch (error) {
        console.error("Erro ao atribuir estudantes:", error);
        notifications.show({
          message:
            error instanceof Error
              ? error.message
              : "Erro ao atribuir estudantes",
          color: "red",
        });
      }
    });
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleStudentChange = (selectedIds: string[]) => {
    setValue("studentIds", selectedIds);
  };

  return {
    // Form
    control,
    errors,
    handleSubmit: handleSubmit(handleAssignStudents),
    
    // Data
    studentOptions,
    studentsSelected,
    
    // Handlers
    handleClose,
    handleStudentChange,
    
    // State
    isPending,
    isSessionPending,
  };
}
