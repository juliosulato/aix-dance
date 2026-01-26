"use client";

import { LoadingOverlay, Text } from "@mantine/core";
import { useSession } from "@/lib/auth-client";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useClassView } from "@/hooks/academic/useClassView";
import { ClassBasicInfo } from "./ClassBasicInfo";
import { ClassSchedule } from "./ClassSchedule";
import { ClassStudents } from "./ClassStudents";
import { ClassActions } from "./ClassActions";
import AssignStudents from "@/modules/academic/classes/AssignStudentsModal/AssignStudentsModal";
import ClassForm from "@/modules/academic/classes/ClassForm";

interface ClassViewProps {
  id: string;
}

export default function ClassView({ id }: ClassViewProps) {
  const session = useSession();
  const tenantId = session?.data?.user.tenantId as string;

  const {
    classData,
    activeStudents,
    inactiveStudents,
    isLoading,
    error,
    modals,
    openUpdate,
    closeUpdate,
    openAssign,
    closeAssign,
    openArchiveConfirm,
    closeArchiveConfirm,
    handleArchive,
    isArchiving,
    goToStudent,
    mutate,
  } = useClassView({ classId: id, tenantId });

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8">
        <Text c="red">Falha ao carregar os dados da turma.</Text>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8">
        <Text>Turma não encontrada.</Text>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      {/* Header com título e ações */}
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          {classData.name}
        </h1>
        <ClassActions
          onUpdate={openUpdate}
          onAssign={openAssign}
          onArchive={openArchiveConfirm}
        />
      </div>

      {/* Informações Básicas */}
      <ClassBasicInfo
        name={classData.name}
        modality={classData.modality}
        teacher={classData.teacher}
        assistant={classData.assistant}
        online={classData.online}
      />

      {/* Dias e Horários */}
      <ClassSchedule days={classData.days} />

      {/* Alunos */}
      <ClassStudents
        activeStudents={activeStudents}
        inactiveStudents={inactiveStudents}
        onStudentClick={goToStudent}
      />

      {/* Modais */}
      <ClassForm
        opened={modals.isUpdateOpen}
        onClose={closeUpdate}
        isEditing={
          classData
            ? {
                id: classData.id,
                name: classData.name,
                modalityId: classData.modality.id,
                teacherId: classData.teacher.id,
                assistantId: classData.assistant?.id || null,
                online: classData.online,
                days: classData.days.map((day) => ({
                  dayOfWeek: day.dayOfWeek as any,
                  initialHour: day.initialHour,
                  endHour: day.endHour,
                })),
                studentClasses: classData.studentClasses?.map((sc) => ({
                  id: sc.id,
                  studentId: sc.studentId,
                })),
              }
            : null
        }
      />

      <AssignStudents
        classData={classData as any}
        onClose={closeAssign}
        opened={modals.isAssignOpen}
        mutate={mutate}
      />

      <ConfirmationModal
        opened={modals.isArchiveConfirmOpen}
        onClose={closeArchiveConfirm}
        onConfirm={handleArchive}
        title="Arquivar Turma"
        confirmLabel="Arquivar"
        cancelLabel="Cancelar"
        confirmColor="orange"
        loading={isArchiving}
      >
        Você tem certeza que deseja arquivar a turma{" "}
        <strong>{classData.name}</strong>?
        <br />
        <Text component="span" c="orange" size="sm" fw={500} mt="md">
          Atenção: esta ação não pode ser desfeita.
        </Text>
      </ConfirmationModal>
    </div>
  );
}
