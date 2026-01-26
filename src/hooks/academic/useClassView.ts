import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { notifications } from "@mantine/notifications";
import { fetcher } from "@/utils/fetcher";
import { archiveClass } from "@/actions/academic/class.actions";
import { Class, Modality } from "@/types/class.types";
import { User } from "@/types/user.types";
import { Student, StudentClass } from "@/types/student.types";

interface ClassFromApi extends Class {
  modality: Modality;
  teacher: User;
  assistant: User | null;
  studentClasses: (StudentClass & {
    student: Student;
  })[];
  days: {
    dayOfWeek: string;
    initialHour: string;
    endHour: string;
  }[];
}

interface UseClassViewProps {
  classId: string;
  tenantId: string;
}

export function useClassView({ classId, tenantId }: UseClassViewProps) {
  const router = useRouter();

  // Modais
  const [isUpdateOpen, setUpdateOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [isArchiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Busca dados da turma
  const { data, error, isLoading, mutate } = useSWR<ClassFromApi>(
    tenantId && classId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${tenantId}/academic/classes/${classId}`
      : null,
    fetcher
  );

  // Alunos ativos e inativos
  const activeStudents = data?.studentClasses?.filter(
    (sc) => sc.status === "ACTIVE"
  ) || [];

  const inactiveStudents = data?.studentClasses?.filter(
    (sc) => sc.status === "INACTIVE"
  ) || [];

  // Handler de arquivamento
  const handleArchive = async () => {
    if (!data?.id) return;

    setIsArchiving(true);
    try {
      const result = await archiveClass(data.id);

      if (result.success) {
        notifications.show({
          message: "Turma arquivada com sucesso",
          color: "green",
        });
        router.push("/system/academic/classes");
        router.refresh();
      } else {
        throw new Error(result.error || "Erro ao arquivar turma");
      }
    } catch (error) {
      console.error("Erro ao arquivar turma:", error);
      notifications.show({
        message:
          error instanceof Error ? error.message : "Erro ao arquivar turma",
        color: "red",
      });
    } finally {
      setIsArchiving(false);
      setArchiveConfirmOpen(false);
    }
  };

  // Navegação para perfil do aluno
  const goToStudent = (studentId: string) => {
    router.push(`/system/academic/students/${studentId}`);
  };

  // Handlers dos modais
  const openUpdate = () => setUpdateOpen(true);
  const closeUpdate = () => {
    setUpdateOpen(false);
    mutate();
  };

  const openAssign = () => setAssignOpen(true);
  const closeAssign = () => {
    setAssignOpen(false);
    mutate();
  };

  const openArchiveConfirm = () => setArchiveConfirmOpen(true);
  const closeArchiveConfirm = () => setArchiveConfirmOpen(false);

  return {
    // Data
    classData: data,
    activeStudents,
    inactiveStudents,
    isLoading,
    error,
    mutate,

    // Modais state
    modals: {
      isUpdateOpen,
      isAssignOpen,
      isArchiveConfirmOpen,
    },

    // Handlers dos modais
    openUpdate,
    closeUpdate,
    openAssign,
    closeAssign,
    openArchiveConfirm,
    closeArchiveConfirm,

    // Actions
    handleArchive,
    isArchiving,
    goToStudent,
  };
}
