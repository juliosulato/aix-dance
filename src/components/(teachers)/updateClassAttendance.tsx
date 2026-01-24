import React, { useState } from "react";
import { Button, Modal, Table, Textarea } from "@mantine/core";
import { ClassFromApi } from "../(academic)/(class)";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";


const schema = z
  .object({
    date: z.date({ error: "Date is required" }),
    isSubstitute: z.boolean().optional(),
    notes: z.string().optional(),
    classId: z.string().min(1, "Class ID is required"),
    attendanceRecords: z
      .array(
        z.object({
          studentId: z.string().min(1, "Student ID is required"),
          present: z.boolean().optional(),
          notes: z.string().optional(),
        })
      )
      .optional(),
  })
  .partial();

export default function UpdateClassAttendance({
  studentsClass,
  opened,
  onClose,
  teacherId,
}: {
  studentsClass: ClassFromApi;
  opened: boolean;
  onClose: () => void;
  teacherId: string;
  prevClassAttendance: any;
}) {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date(),
      isSubstitute: studentsClass.teacherId !== teacherId,
      notes: "",
      classId: studentsClass.id,
    },
  });

  // Estado para controlar presença/falta dos alunos
  const [attendance, setAttendance] = useState(
    studentsClass.studentClasses.map((student) => ({
      studentId: student.studentId,
      present: true, // padrão: presente
      notes: "",
    }))
  );

  // Alterna presença/falta
  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId
          ? { ...record, present: !record.present }
          : record
      )
    );
  };

  const createClassAttendance = async (data: z.infer<typeof schema>) => {
    const payload = {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
      attendanceRecords: attendance,
      teacherId,
    };

    await fetch(
      `/api/v1/tenants/${studentsClass.tenantId}/class-attendances`,
      {
        method: "PUT",
                credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).then((res) => {
      if (!res.ok) {
        notifications.show({
          title: "Erro",
          message: "Falha ao criar a lista de chamada.",
          color: "red",
        });
      }
      notifications.show({
        title: "Sucesso",
        message: "Lista de chamada criada com sucesso!",
        color: "green",
      });
      setAttendance(
        studentsClass.studentClasses.map((student) => ({
          studentId: student.studentId,
          present: true, // reset para presente
          notes: "",
        }))
      );
      return res.json();
    });

    console.log("Creating class attendance with data:", payload);
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
      title={"Atualizar Chamada"}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      {studentsClass.teacherId !== teacherId}
      <form
        onSubmit={handleSubmit(createClassAttendance, handleFormErrors)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              label="Data"
              placeholder="Selecione a data"
              value={
                field.value instanceof Date
                  ? field.value
                  : field.value
                  ? new Date(field.value)
                  : new Date()
              }
              onChange={(value) => field.onChange(value)}
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
              const studentAttendance = attendance.find(
                (a) => a.studentId === student.studentId
              );
              const isPresent = studentAttendance?.present;
              return (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <div className="bg-primary text-white flex items-center justify-center w-full min-h-12 !font-bold rounded-xl">
                      {index + 1}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    {student.student.firstName} {student.student.lastName}
                  </Table.Td>
                  <Table.Td>
                    <button
                      className={`w-8 h-8 lg:w-12 lg:h-12 text-xl !font-bold flex items-center justify-center rounded-full ${
                        isPresent ? "bg-green-500" : "bg-red-500"
                      } text-white`}
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
          className="text-sm! font-medium! tracking-wider"
        >
          Atualizar Chamada
        </Button>
      </form>
    </Modal>
  );
}
