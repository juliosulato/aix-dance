"use client"

import { Avatar, Button, LoadingOverlay, Modal, MultiSelect } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { EnrollStudentsInput, getEnrollStudentsSchema } from "@/schemas/academic/class.schema";
import useSWR, { KeyedMutator } from "swr";
import { ClassFromApi } from ".."; // Ajuste o caminho se necessário
import { fetcher } from "@/utils/fetcher";
import { Student, StudentClass } from "@prisma/client";
import Image from "next/image";
import notFound from "@/assets/images/not-found.avif";
import { FaSearch } from "react-icons/fa";
import { StudentFromApi } from "../../(students)/StudentFromApi";

// Interface para representar a matrícula com o aluno aninhado, como vem da API
interface StudentClassWithStudent extends StudentClass {
    student: Student;
}

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<any>;
    classData: (ClassFromApi & { days: any[], studentClasses: StudentClassWithStudent[] }) | null;
}

function AssignStudents({ opened, onClose, mutate, classData }: Props) {
    const t = useTranslations("academic.classes.modals.assignStudents");
    const g = useTranslations("general");
    const formStepsT = useTranslations("academic.classes.modals.formSteps.two");
    const rootT = useTranslations(""); // Para chaves na raiz, como 'forms'
    const [visible, setVisible] = useState(false);
    const { data: sessionData, status } = useSession();

    const enrollSchema = getEnrollStudentsSchema(t);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<EnrollStudentsInput>({
        resolver: zodResolver(enrollSchema),
        defaultValues: { studentIds: [] }
    });

    const activeEnrollments = useMemo(
        () => classData?.studentClasses?.filter((e: any) => e.status === 'ACTIVE') || [],
        [classData?.studentClasses]
    );

    const handleClose = () => {
        onClose();
        reset();
    }

    // 1. Busca todos os alunos da tenancy para popular o dropdown
    const { data: allStudents } = useSWR<StudentFromApi[]>(
        () => sessionData?.user.tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/students` : null,
        fetcher
    );

    const studentOptions = useMemo(() => {
        const optionsMap = new Map<string, { label: string; value: string }>();

        if (activeEnrollments) {
            activeEnrollments.forEach((enrollment: any) => {
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
            allStudents.forEach(student => {
                optionsMap.set(student.id, {
                    label: `${student.firstName} ${student.lastName}`,
                    value: student.id,
                });
            });
        }

        return Array.from(optionsMap.values());
    }, [allStudents, activeEnrollments]);


    useEffect(() => {
        if (classData && classData.studentClasses) {
            const currentStudentIds = activeEnrollments.map((enrollment: any) => enrollment.student.id);
            reset({ studentIds: currentStudentIds });
        }
    }, [classData, activeEnrollments, reset]);
    const selectedStudentIds = useWatch({ control, name: "studentIds", defaultValue: [] });

    const studentsMap = useMemo(() => {
        const map = new Map<string, Student>();
        if (activeEnrollments) {
            activeEnrollments.forEach((enrollment: any) => map.set(enrollment.student.id, enrollment.student));
        }
        if (allStudents) {
            allStudents.forEach(student => map.set(student.id, student));
        }
        return map;
    }, [allStudents, activeEnrollments]);

    const studentsSelected = useMemo(() => {
        return (selectedStudentIds || [])
            .map(id => studentsMap.get(id))
            .filter((student): student is Student => !!student);
    }, [selectedStudentIds, studentsMap]);


async function handleAssignStudents(data: EnrollStudentsInput) {
  if (status !== "authenticated" || !classData?.id) return;
  setVisible(true);

  const initialStudentIds = activeEnrollments.map((e: any) => e?.student?.id);
  const finalStudentIds = data.studentIds || [];

  const studentsToEnroll = finalStudentIds.filter(id => !initialStudentIds.includes(id));
  const studentsToArchive = initialStudentIds.filter(id => !finalStudentIds.includes(id));

  const promises: Promise<Response>[] = [];
  const tenancyId = sessionData!.user.tenancyId;
  const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes/${classData.id}/enrollments`;
  const className = classData?.name || "Turma desconhecida";

  if (studentsToEnroll.length > 0) {
    // Matrícula
    promises.push(fetch(baseUrl, {
      method: "POST",
      body: JSON.stringify({ studentIds: studentsToEnroll }),
      headers: { "Content-Type": "application/json" },
    }));

    studentsToEnroll.forEach((studentId) => {
      promises.push(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${studentId}/history`,
          {
            method: "POST",
            body: JSON.stringify({
              description: `Aluno matriculado na turma ${className}`,
            }),
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    });
  }

  if (studentsToArchive.length > 0) {
    // Arquivar
    promises.push(fetch(`${baseUrl}/archive`, {
      method: "PATCH",
      body: JSON.stringify({ studentIds: studentsToArchive }),
      headers: { "Content-Type": "application/json" },
    }));

    // Histórico de cada aluno removido
    studentsToArchive.forEach((studentId) => {
      promises.push(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${studentId}/history`,
          {
            method: "POST",
            body: JSON.stringify({
              description: `Aluno removido da turma ${className}`,
            }),
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    });
  }

  if (promises.length === 0) {
    notifications.show({ message: t("notifications.noChanges") });
    onClose();
    setVisible(false);
    return;
  }

  try {
    const responses = await Promise.all(promises);
    const hasError = responses.some((res) => !res.ok);
    if (hasError) throw new Error("Uma ou mais operações falharam.");

    notifications.show({ message: t("notifications.success"), color: "green" });
    await mutate();
    handleClose();
  } catch (err) {
    console.error(err);
    notifications.show({ color: "red", message: t("notifications.error") });
  } finally {
    setVisible(false);
  }
}


    if (status === "loading") return <LoadingOverlay visible />;

    return (
        <>
            <Modal opened={opened} onClose={handleClose} title={t("title")} size="lg" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(handleAssignStudents)} className="flex flex-col gap-4 md:gap-6 p-4">
                    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
                        <Controller
                            name="studentIds"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    label={formStepsT("fields.students.label")}
                                    placeholder={formStepsT("fields.students.placeholder")}
                                    data={studentOptions}
                                    {...field}
                                    searchable
                                    className="!w-full"
                                    nothingFoundMessage={g("notFound")}
                                    rightSection={<FaSearch />}
                                    error={errors.studentIds?.message}
                                />
                            )}
                        />
                        <div className="p-4 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-[200px]">
                            {studentsSelected.length === 0 ? (
                                <div className="flex flex-col gap-3 items-center justify-center text-center m-auto">
                                    <Image src={notFound} alt={t("noStudents.alt")} className="max-w-[150px]" />
                                    <h3 className="text-xl text-primary font-bold">{t("noStudents.title")}</h3>
                                    <p className="max-w-xs text-neutral-500">{t("noStudents.description")}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {studentsSelected.map(student => (
                                        <div key={student.id} className="flex items-center gap-3 bg-neutral-50 p-2 rounded-lg">
                                            <Avatar src={student.image} name={`${student.firstName} ${student.lastName}`} radius="xl" />
                                            <div>
                                                <p className="font-semibold">{`${student.firstName} ${student.lastName}`}</p>
                                                <p className="text-sm text-neutral-500">{student.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button variant="default" onClick={handleClose} radius="lg" size="md">{rootT("general.actions.cancel")}</Button>
                        <Button type="submit" color="#7439FA" radius="lg" size="md">{rootT("forms.submit")}</Button>
                    </div>
                </form>
            </Modal>
            <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'violet', type: 'dots' }} />
        </>
    )
}

export default AssignStudents;

