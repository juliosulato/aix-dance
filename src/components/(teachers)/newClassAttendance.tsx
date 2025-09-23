
import React, { useState, useEffect } from "react";
import { Avatar, Button, Modal, Table, Textarea, TextInput } from "@mantine/core";
import { ClassFromApi } from "../(academic)/(class)";
import z, { date } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateInput, DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import { notifications } from "@mantine/notifications";

const schema = z.object({
    date: z.date({ error: "Date is required" }),
    isSubstitute: z.boolean().optional(),
    notes: z.string().optional(),
    classId: z.string().min(1, "Class ID is required"),
    attendanceRecords: z.array(z.object({
        studentId: z.string().min(1, "Student ID is required"),
        present: z.boolean().optional(),
        notes: z.string().optional(),
    })).optional(),
})

export default function NewClassAttendance({ studentsClass, opened, onClose, teacherId, attendanceToEdit }: {
    studentsClass: ClassFromApi,
    opened: boolean,
    onClose: () => void,
    teacherId: string,
    attendanceToEdit?: any // tipar conforme seu modelo de chamada
}) {

    const { control, register, formState: { errors }, handleSubmit, reset, setValue } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema) as any,
        defaultValues: attendanceToEdit ? {
            date: attendanceToEdit.date ? new Date(attendanceToEdit.date) : new Date(),
            isSubstitute: attendanceToEdit.isSubstitute,
            notes: attendanceToEdit.notes || '',
            classId: studentsClass.id,
            attendanceRecords: attendanceToEdit.attendanceRecords?.map((rec: any) => ({
                studentId: rec.studentId,
                present: rec.present,
                notes: rec.notes || ''
            }))
        } : {
            date: new Date(),
            isSubstitute: studentsClass.teacherId !== teacherId,
            notes: '',
            classId: studentsClass.id,
        }
    });

    // Estado para controlar presença/falta dos alunos
    const [attendance, setAttendance] = useState(() => {
        if (attendanceToEdit && attendanceToEdit.attendanceRecords) {
            return studentsClass.studentClasses.map(student => {
                const found = attendanceToEdit.attendanceRecords.find((rec: any) => rec.studentId === student.studentId);
                return {
                    studentId: student.studentId,
                    present: found !== undefined ? found.present : true,
                    notes: found ? found.notes || '' : ''
                };
            });
        } else {
            return studentsClass.studentClasses.map(student => ({
                studentId: student.studentId,
                present: true,
                notes: ""
            }));
        }
    });

    // Sempre que abrir para editar, sincroniza attendance com attendanceToEdit
    useEffect(() => {
        if (attendanceToEdit && attendanceToEdit.attendanceRecords) {
            setAttendance(
                studentsClass.studentClasses.map(student => {
                    const found = attendanceToEdit.attendanceRecords.find((rec: any) => rec.studentId === student.studentId);
                    return {
                        studentId: student.studentId,
                        present: found !== undefined ? found.present : true,
                        notes: found ? found.notes || '' : ''
                    };
                })
            );
        }
    }, [attendanceToEdit, studentsClass.studentClasses]);

    // Alterna presença/falta
    const toggleAttendance = (studentId: string) => {
        setAttendance(prev =>
            prev.map(record =>
                record.studentId === studentId
                    ? { ...record, present: !record.present }
                    : record
            )
        );
    };

    const submitClassAttendance = async (data: z.infer<typeof schema>) => {
        const payload = {
            ...data,
            date: data.date instanceof Date ? data.date.toISOString() : data.date,
            attendanceRecords: attendance,
            teacherId
        };

        const url = attendanceToEdit
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${studentsClass.tenancyId}/class-attendances/${attendanceToEdit.id}`
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${studentsClass.tenancyId}/class-attendances`;
        const method = attendanceToEdit ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((res) => {
            if (!res.ok) {
                notifications.show({
                    title: "Erro",
                    message: attendanceToEdit ? "Falha ao atualizar a lista de chamada." : "Falha ao criar a lista de chamada.",
                    color: "red",
                });
            }
            notifications.show({
                title: "Sucesso",
                message: attendanceToEdit ? "Lista de chamada atualizada com sucesso!" : "Lista de chamada criada com sucesso!",
                color: "green",
            });
            setAttendance(studentsClass.studentClasses.map(student => ({
                studentId: student.studentId,
                present: true, // reset para presente
                notes: ""
            })));
            return res.json();
        });

        reset();
        onClose();
    };

    const handleFormErrors = (errors: any) => {
        console.warn("Form errors:", errors);
    };

    return (
        <Modal
            opened={opened}
            onClose={() => {
                onClose();
                reset();
            }}
            title={"Nova Chamada"}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            {studentsClass.teacherId !== teacherId}
            <form
                onSubmit={handleSubmit(submitClassAttendance, handleFormErrors)}
                className="flex flex-col gap-4"
            >
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                        <DateTimePicker
                            label="Data"
                            placeholder="Selecione a data"
                            value={field.value instanceof Date ? field.value : (field.value ? new Date(field.value) : new Date())}
                            onChange={value => field.onChange(value)}
                            error={errors.date?.message}
                            required
                            locale={"pt-br"}
                            withSeconds={false}
                        />
                    )}
                />
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nº</Table.Th>
                            <Table.Th>Nome</Table.Th>
                            <Table.Th>Presença</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {studentsClass.studentClasses.map((student, index) => {
                            const studentAttendance = attendance.find(a => a.studentId === student.studentId);
                            const isPresent = studentAttendance?.present;
                            return (
                                <Table.Tr key={student.id}>
                                    <Table.Td>
                                        <div className="bg-primary text-white flex items-center justify-center w-full min-h-12 !font-bold rounded-xl">
                                            {index + 1}
                                        </div>
                                    </Table.Td>
                                    <Table.Td>{student.student.firstName} {student.student.lastName}</Table.Td>
                                    <Table.Td>
                                        <button
                                            className={`w-8 h-8 lg:w-12 lg:h-12 text-xl !font-bold flex items-center justify-center rounded-full ${isPresent ? "bg-green-500" : "bg-red-500"} text-white`}
                                            type="button"
                                            onClick={() => toggleAttendance(student.studentId)}
                                        >
                                            {isPresent ? "P" : "F"}
                                        </button>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
                <Textarea
                    label="Notas"
                    {...register("notes")}
                    error={errors.notes?.message}
                />
                <Button
                    type="submit"
                    color="#7439FA"
                    radius="lg"
                    size="md"
                    className="!text-sm !font-medium tracking-wider"
                >
                    {attendanceToEdit ? "Atualizar Chamada" : "Salvar Chamada"}
                </Button>
            </form>
        </Modal>
    );
}