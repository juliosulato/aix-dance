import { Avatar } from "@mantine/core";
import Image from "next/image";
import notFound from "@/assets/images/not-found.png";
import { Student } from "@/types/student.types";

interface StudentsListProps {
  students: Student[];
}

export function StudentsList({ students }: StudentsListProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center text-center m-auto">
        <Image
          src={notFound}
          alt="Nenhum aluno encontrado"
          className="max-w-150px"
        />
        <h3 className="text-xl text-primary font-bold">
          Nenhum aluno encontrado
        </h3>
        <p className="max-w-xs text-neutral-500">
          Não encontramos estudantes disponíveis para esta turma.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg"
        >
          <Avatar
            src={student.image}
            name={`${student.firstName} ${student.lastName}`}
            radius="xl"
          />
          <div>
            <p className="font-semibold">{`${student.firstName} ${student.lastName}`}</p>
            <p className="text-sm text-neutral-500">{student.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
