"use client"

import { Avatar, Button, LoadingOverlay, Modal, MultiSelect } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { EnrollStudentsInput, enrollStudentsSchema } from "@/schemas/academic/class.schema";
import useSWR, { KeyedMutator } from "swr";
import { ClassFromApi } from ".."; // Ajuste o caminho se necessário
import { fetcher } from "@/utils/fetcher";
import { Class, Student, StudentClass } from "@prisma/client";
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
    const [visible, setVisible] = useState(false);
    const { data: sessionData, status } = useSession();

    const enrollSchema = enrollStudentsSchema;

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<EnrollStudentsInput>({
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
            promises.push(fetch(baseUrl, {
                method: "POST",
                body: JSON.stringify({ studentIds: studentsToEnroll }),
                headers: { "Content-Type": "application/json" },
            }));

            studentsToEnroll.forEach(async (studentId) => {
                const student: StudentFromApi = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${studentId}`).then(res => res.json());

                if (student.subscriptions.length === 0) {
                    notifications.show({ message: "O aluno " + student.firstName + " " + student.lastName + " não possui um plano ativo.", color: "red" });
                    return;
                }

                if (student.subscriptions.length > 1) {
                    notifications.show({ message: "O aluno " + student.firstName + " " + student.lastName + " possui mais de um plano ativo. Verifique manualmente.", color: "yellow" });
                    return;
                }

                if (!student.classes) {
                    notifications.show({ message: "Não foi possível verificar as aulas do aluno " + student.firstName + " " + student.lastName + ".", color: "red" });
                    return;
                }

                if (!student.subscriptions[0].plan) {
                    notifications.show({ message: "O aluno " + student.firstName + " " + student.lastName + " não possui um plano ativo.", color: "red" });
                    return;
                }

                const studentClassesLength = student.classes.filter((c: Class) => c.active == true).length;
                const plan = student.subscriptions[0].plan;

                if (plan.frequency >= studentClassesLength) {
                    notifications.show({ message: "O aluno " + student.firstName + " " + student.lastName + " atingiu o limite de aulas do plano.", color: "red" });
                    return;
                }

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
            notifications.show({ message: "Erro ao processar solicitação" });
            onClose();
            setVisible(false);
            return;
        }

        try {
            const responses = await Promise.all(promises);
            const hasError = responses.some((res) => !res.ok);
            if (hasError) throw new Error("Uma ou mais operações falharam.");

            notifications.show({ message: "Estudantes atribuídos com sucesso", color: "green" });
            await mutate();
            handleClose();
        } catch (err) {
            console.error(err);
            notifications.show({ color: "red", message: "Erro ao atribuir estudantes" });
        } finally {
            setVisible(false);
        }
    }

    const [invalidStudentIds, setInvalidStudentIds] = useState<string[]>([]);
    const [validatingIds, setValidatingIds] = useState<string[]>([]);

    const handleStudentChange = async (selectedIds: string[]) => {
        const prevIds = selectedStudentIds || [];
        const addedIds = selectedIds.filter(id => !prevIds.includes(id));
        if (addedIds.length === 0) {
            setInvalidStudentIds(ids => ids.filter(id => selectedIds.includes(id)));
            setValue("studentIds", selectedIds);
            return;
        }

        const newId = addedIds[0];
        setValidatingIds(ids => [...ids, newId]);
        const student = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData?.user.tenancyId}/students/${newId}`
        ).then(res => res.json());

        let error = "";
        if (!student.subscriptions || student.subscriptions.length === 0)
            error = "não possui um plano ativo.";
        else if (student.subscriptions.length > 1)
            error = "possui mais de um plano ativo. Verifique manualmente.";
        else if (!student.classes)
            error = "não foi possível verificar as aulas.";
        else if (!student.subscriptions[0].plan)
            error = "não possui um plano ativo.";
        else if (student.classes.length >= student.subscriptions[0].plan.frequency)
            error = "atingiu o limite de aulas do plano.";

        if (error) {
            notifications.show({ message: `O aluno ${student.firstName} ${student.lastName} ${error}`, color: "red" });
            setInvalidStudentIds(ids => [...ids, newId]);
            setValue("studentIds", prevIds);
        } else {
            setValue("studentIds", selectedIds);
        }
        setValidatingIds(ids => ids.filter(id => id !== newId));
    };

    if (status === "loading") return <LoadingOverlay visible />;

    return (
        <>
            <Modal opened={opened} onClose={handleClose} title={"Atribuir Estudantes"} size="lg" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
                <form onSubmit={handleSubmit(handleAssignStudents)} className="flex flex-col gap-4 md:gap-6 p-4">
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
                                    className="!w-full"
                                    nothingFoundMessage={"Nada encontrado..."}
                                    rightSection={<FaSearch />}
                                    onChange={handleStudentChange}
                                    error={errors.studentIds?.message}
                                />
                            )}
                        />
                        <div className="p-4 border border-neutral-300 rounded-2xl flex flex-col gap-4 min-h-[200px]">
                            {studentsSelected.length === 0 ? (
                                <div className="flex flex-col gap-3 items-center justify-center text-center m-auto">
                                    <Image src={notFound} alt="Nenhum estudante encontrado" className="max-w-[150px]" />
                                    <h3 className="text-xl text-primary font-bold">Nenhum estudante encontrado</h3>
                                    <p className="max-w-xs text-neutral-500">Não encontramos estudantes disponíveis para esta turma.</p>
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
                        <Button variant="default" onClick={handleClose} radius="lg" size="md">Cancelar</Button>
                        <Button type="submit" color="#7439FA" radius="lg" size="md">Salvar</Button>
                    </div>
                </form>
            </Modal>
            <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'violet', type: 'dots' }} />
        </>
    )
}

export default AssignStudents;

