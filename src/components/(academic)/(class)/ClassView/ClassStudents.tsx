import { Avatar, Divider, Text } from "@mantine/core";
import { Student, StudentClass } from "@/types/student.types";

interface StudentWithClass extends StudentClass {
  student: Student;
}

interface ClassStudentsProps {
  activeStudents: StudentWithClass[];
  inactiveStudents: StudentWithClass[];
  onStudentClick: (studentId: string) => void;
}

export function ClassStudents({
  activeStudents,
  inactiveStudents,
  onStudentClick,
}: ClassStudentsProps) {
  return (
    <>
      {/* Alunos Ativos */}
      <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">
        Alunos Ativos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeStudents.length > 0 ? (
          activeStudents.map((link) => (
            <div
              key={link.student.id}
              onClick={() => onStudentClick(link.student.id)}
              className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg cursor-pointer hover:bg-neutral-100 transition"
            >
              <Avatar
                src={link.student.image || undefined}
                name={`${link.student.firstName} ${link.student.lastName}`}
                radius="xl"
              />
              <div>
                <p className="font-semibold">
                  {`${link.student.firstName} ${link.student.lastName}`}
                </p>
                <p className="text-sm text-neutral-500">{link.student.email}</p>
              </div>
            </div>
          ))
        ) : (
          <Text className="text-neutral-500 md:col-span-full">
            Nenhum aluno ativo nesta turma
          </Text>
        )}
      </div>

      {/* Alunos Inativos */}
      {inactiveStudents.length > 0 && (
        <>
          <Divider label="Alunos Inativos" labelPosition="center" my="md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveStudents.map((link) => (
              <div
                key={link.student.id}
                onClick={() => onStudentClick(link.student.id)}
                className="flex items-center gap-3 bg-neutral-200 hover:bg-neutral-50 p-2 rounded-lg cursor-pointer transition"
              >
                <Avatar
                  src={link.student.image || undefined}
                  name={`${link.student.firstName} ${link.student.lastName}`}
                  radius="xl"
                />
                <div>
                  <p className="font-semibold">
                    {`${link.student.firstName} ${link.student.lastName}`}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {link.student.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
