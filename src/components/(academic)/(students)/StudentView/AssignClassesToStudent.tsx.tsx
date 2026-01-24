"use client";

import { Button, LoadingOverlay, Modal, MultiSelect, Text, Alert } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "@/utils/fetcher";
import Image from "next/image";
import notFound from "@/assets/images/not-found.png";
import { FaSearch } from "react-icons/fa";
import z from "zod";
import { StudentComplete } from "@/types/student.types";
import { Class } from "@/types/class.types";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<any>;
  student: StudentComplete; // classes vem com studentClasses do aluno
};

type FormValues = {
  classIds: string[];
};

function AssignClassesToStudent({ opened, onClose, mutate, student }: Props) {
  const [visible, setVisible] = useState(false);
  const { data: sessionData, isPending } = useSession();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({ classIds: z.array(z.string()) })
    ),
    defaultValues: { classIds: [] },
  });

  const { data: allClasses } = useSWR<PaginatedResponseLocal<Class>>(
    () =>
      sessionData?.user.tenantId
        ? `/api/v1/tenants/${sessionData.user.tenantId}/classes`
        : null,
    fetcher
  );

  const classes = allClasses?.data;

  const activeClassIds = useMemo(
    () =>
      student.classes
        ?.filter((sc: any) => sc.status === "ACTIVE")
        .map((sc: any) => sc.classId) || [],
    [student.classes]
  );

  useEffect(() => {
    reset({ classIds: activeClassIds });
  }, [student, activeClassIds, reset]);

  // 🔹 4. Opções para o MultiSelect
  const classOptions = useMemo(() => {
        return (
      classes?.map((c) => ({
        label: `${c.name} (${c.modality?.name || "-"})`,
        value: c.id,
      })) || []
    );
  }, [classes]);

  // 🔹 5. Assistir seleção
  const selectedClassIds = useWatch({ control, name: "classIds", defaultValue: [] });

  // 🔹 6. Enviar mudanças
  async function handleAssignClasses(data: FormValues) {
    if (status !== "authenticated" || !student?.id) return;
    setVisible(true);

    const studentPlanFrequency = student?.subscriptions && student.subscriptions[0].plan ? student.subscriptions[0].plan.frequency : 0;

    if (studentPlanFrequency > 0 && data.classIds.length > studentPlanFrequency) {
      notifications.show({ message: "O aluno não pode ser matriculado em mais turmas do que o permitido pelo plano.", color: "red" });
      setVisible(false);
      return;
    }

    const initialIds = activeClassIds;
    const finalIds = data.classIds || [];

    const toEnroll = finalIds.filter((id) => !initialIds.includes(id));
    const toRemove = initialIds.filter((id) => !finalIds.includes(id));

    const promises: Promise<Response>[] = [];
    const tenantId = sessionData!.user.tenantId;

    if (toEnroll.length > 0) {

      toEnroll.forEach((classId) => {
        const classInfo = classes?.find((c) => c.id === classId);
        const className = classInfo?.name || "Turma desconhecida";

        promises.push(
          fetch(
            `/api/v1/tenants/${tenantId}/classes/${classId}/enrollments`,
            {
              method: "POST",
                credentials: "include",
              body: JSON.stringify({ studentIds: [student.id] }),
              headers: { "Content-Type": "application/json" },
            }
          ),
        );

        promises.push(
          fetch(
            `/api/v1/tenants/${tenantId}/students/${student.id}/history`,
            {
              method: "POST",
                credentials: "include",
              body: JSON.stringify({
                description: `Aluno adiciona na turma ${className}`,
              }),
              headers: { "Content-Type": "application/json" },
            }
          )
        );
      });
    }

    if (toRemove.length > 0) {
      toRemove.forEach((classId) => {
        const classInfo = classes?.find((c) => c.id === classId);
        const className = classInfo?.name || "Turma desconhecida";

        // Arquivar matrícula
        promises.push(
          fetch(
            `/api/v1/tenants/${tenantId}/classes/${classId}/enrollments/archive`,
            {
              method: "PATCH",
              body: JSON.stringify({ studentIds: [student.id] }),
              headers: { "Content-Type": "application/json" },
            }
          )
        );

        promises.push(
          fetch(
            `/api/v1/tenants/${tenantId}/students/${student.id}/history`,
            {
              method: "POST",
                credentials: "include",
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
      notifications.show({ message: "Nenhuma alteração detectada." });
      onClose();
      setVisible(false);
      return;
    }

    try {
      const responses = await Promise.all(promises);
      const hasError = responses.some((res) => !res.ok);
      if (hasError) throw new Error("Erro ao salvar");

      notifications.show({ message: "Matrículas atualizadas com sucesso.", color: "green" });
      await mutate();
      onClose();
    } catch (err) {
      console.error(err);
      notifications.show({ message: "Erro ao atualizar matrículas.", color: "red" });
    } finally {
      setVisible(false);
    }
  }

  if (isPending) return <LoadingOverlay visible />;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={`Atribuir turmas para ${student.firstName}`}
        size="lg"
        radius="lg"
        centered
      >
        <form
          onSubmit={handleSubmit(handleAssignClasses)}
          className="flex flex-col gap-4 p-4"
        >
          {/* Alerta de bloqueio acadêmico */}
          {student.active === false && (
            <Alert color="red" title="Ação Bloqueada" radius="md" mb="md">
              <Text size="sm">
                Este aluno está <strong>inativo</strong> devido a pendências financeiras. Não é possível matricular em turmas enquanto o status estiver bloqueado.
              </Text>
            </Alert>
          )}
          <Controller
            name="classIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label={"Turmas"}
                data={classOptions}
                {...field}
                searchable
                className="w-full!"
                nothingFoundMessage={"Nada encontrado..."}
                rightSection={<FaSearch />}
                disabled={student.active === false}
              />
            )}
          />

          <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-2">
                {selectedClassIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Image src={notFound} alt="no-classes" className="max-w-150px" />
                <Text>{"Nenhuma turma selecionada"}</Text>
              </div>
            ) : (
              selectedClassIds.map((classId) => {
                const c = classes?.find((cl) => cl.id === classId);

                return (
                  <div key={classId} className="flex items-center justify-between">
                    <Text>{c?.name}</Text>
                    <Text size="xs" c="dimmed">
                      {c?.modality?.name}
                    </Text>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button variant="default" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" color="violet" disabled={student.active === false}>
              {student.active === false ? "Ação Bloqueada" : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ blur: 2 }} />
    </>
  );
}

export default AssignClassesToStudent;
