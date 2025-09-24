"use client";

import { Class, Modality, Student, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Text } from "@mantine/core";
import DataView from "@/components/ui/DataView";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/es";
import "dayjs/locale/en";
import { adaptStudentClasses, StudentClassFromApi } from "./adapteStudentClasses";
import AssignClassesToStudent from "./AssignClassesToStudent.tsx";
import { StudentFromApi } from "../StudentFromApi";

export interface ClassFromApi extends Class {
  modality: Modality;
  teacher: User;
  assistant: User | null;
  studentClasses: Student[];
}

export default function StudentClassView({ student }: { student: StudentFromApi }) {

  const { status } = useSession();
  const classes = adaptStudentClasses(student);

  const [openAssign, setOpenAssign] = useState(false);

  if (status !== "authenticated") return <div>{"Sessão inválida"}</div>;

  const activeClassLength = student.classes.filter((c: any) => c.status == "ACTIVE").length;

  return (
    <div className="bg-neutral-100 p-4 md:p-6 lg:p-8 rounded-2xl border-neutral-200 border mt-4 md:mt-6">
      <DataView<StudentClassFromApi>
        pageTitle="Turmas"
        data={classes || []}
        baseUrl="/system/academic/classes/"
        openNewModal={ ({
            label: "Texto",
            func: () => setOpenAssign(true)
        })}
        mutate={() => window.location.reload() as any}
        searchbarPlaceholder={"Buscar turmas..."}
        columns={[
          { key: "class.name" as any, label: "Nome da Turma", render: (_, row) => row.class.name },
          { key: "class.studentClasses" as any, label: "Alunos Matriculados", render: (_, row) => row.class.studentClasses.length },
          { key: "enrolledAt", label: "Matriculou-se em", render: (enrolledAt) => dayjs(enrolledAt).format("DD/MM/YYYY") },
          { key: "status", label: "Status", render: (status, row) => status === "ACTIVE" ? "Ativo" : row.leftAt ? `Saiu em ${dayjs(row.leftAt).format("DD/MM/YYYY")}` : "Inativo"
          }
        ]}
        renderCard={(item) => (
          <>
            <div className="flex flex-row justify-between items-start">
              <Text fw={500} size="lg">{item.class.name}</Text>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Text size="sm"><strong>Alunos:</strong> {item.class.studentClasses.length}</Text>
              <Text size="sm"><strong>Matriculado em:</strong> {dayjs(item.enrolledAt).format("DD/MM/YYYY")}</Text>
              <Text size="sm"><strong>Status:</strong>{" "}
                {item.status === "ACTIVE"
                  ? "Ativo"
                  : item.leftAt
                  ? `Saiu em ${dayjs(item.leftAt).format("DD/MM/YYYY")}`
                  : "Inativo"}
              </Text>
            </div>
          </>
        )}
      />

      <AssignClassesToStudent
        opened={openAssign}
        onClose={() => setOpenAssign(false)}
        mutate={() => window.location.reload() as any}
        student={student}
      />
    </div>
  );
}
