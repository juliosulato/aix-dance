"use client";

import { Button, LoadingOverlay, Modal, MultiSelect } from "@mantine/core";
import { Controller } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import { KeyedMutator } from "swr";
import { Student, StudentClass } from "@/types/student.types";
import { Class, Modality } from "@/types/class.types";
import { User } from "@/types/user.types";
import { useAssignStudents } from "@/hooks/academic/useAssignStudents";
import { StudentsList } from "./StudentsList";

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

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<any>;
  classData:
    | (ClassFromApi & {
        days: any[];
        studentClasses: StudentClassWithStudent[];
      })
    | null;
};

function AssignStudents({ opened, onClose, mutate, classData }: Props) {
  const {
    control,
    errors,
    handleSubmit,
    studentOptions,
    studentsSelected,
    handleClose,
    handleStudentChange,
    isPending,
    isSessionPending,
  } = useAssignStudents({ classData, mutate, onClose });

  if (isSessionPending) return <LoadingOverlay visible />;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Atribuir Estudantes"
      size="lg"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 md:gap-6 p-4"
      >
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
          <Controller
            name="studentIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Estudantes"
                placeholder="Selecione os estudantes"
                data={studentOptions}
                {...field}
                searchable
                className="w-full!"
                nothingFoundMessage="Nada encontrado..."
                rightSection={<FaSearch />}
                onChange={handleStudentChange}
                error={errors.studentIds?.message}
              />
            )}
          />

          <div className="p-4 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-200px">
            <StudentsList students={studentsSelected} />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="default"
            onClick={handleClose}
            radius="lg"
            size="md"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="md"
            loading={isPending}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignStudents;
