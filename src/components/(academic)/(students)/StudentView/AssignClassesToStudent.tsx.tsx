"use client";

import { Avatar, Button, LoadingOverlay, Modal, MultiSelect, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "@/utils/fetcher";
import Image from "next/image";
import notFound from "@/assets/images/not-found.avif";
import { FaSearch } from "react-icons/fa";
import { Student } from "@prisma/client";
import z from "zod";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<any>;
  student: Student & { classes: any[] }; // classes vem com studentClasses do aluno
};

type FormValues = {
  classIds: string[];
};

function AssignClassesToStudent({ opened, onClose, mutate, student }: Props) {
  const t = useTranslations("academic.students.modals.assignClasses");
  const g = useTranslations("general");
  const rootT = useTranslations("");
  const [visible, setVisible] = useState(false);
  const { data: sessionData, status } = useSession();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({ classIds: z.array(z.string()) })
    ),
    defaultValues: { classIds: [] },
  });

  // 🔹 1. Buscar TODAS as turmas disponíveis da tenancy
  const { data: allClasses } = useSWR<any[]>(
    () =>
      sessionData?.user.tenancyId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/classes`
        : null,
    fetcher
  );

  // 🔹 2. Matrículas atuais do aluno
  const activeClassIds = useMemo(
    () =>
      student.classes
        ?.filter((sc: any) => sc.status === "ACTIVE")
        .map((sc: any) => sc.classId) || [],
    [student.classes]
  );

  // 🔹 3. Popular o formulário quando abrir o modal
  useEffect(() => {
    reset({ classIds: activeClassIds });
  }, [student, activeClassIds, reset]);

  // 🔹 4. Opções para o MultiSelect
  const classOptions = useMemo(() => {
    return (
      allClasses?.map((c) => ({
        label: `${c.name} (${c.modality?.name || "-"})`,
        value: c.id,
      })) || []
    );
  }, [allClasses]);

  // 🔹 5. Assistir seleção
  const selectedClassIds = useWatch({ control, name: "classIds", defaultValue: [] });

  // 🔹 6. Enviar mudanças
  async function handleAssignClasses(data: FormValues) {
    if (status !== "authenticated" || !student?.id) return;
    setVisible(true);

    const initialIds = activeClassIds;
    const finalIds = data.classIds || [];

    const toEnroll = finalIds.filter((id) => !initialIds.includes(id));
    const toRemove = initialIds.filter((id) => !finalIds.includes(id));

    const promises: Promise<Response>[] = [];
    const tenancyId = sessionData!.user.tenancyId;

    if (toEnroll.length > 0) {
      
      
      toEnroll.forEach((classId) => {
        const classInfo = allClasses?.find((c) => c.id === classId);
      const className = classInfo?.name || "Turma desconhecida";

        promises.push(
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes/${classId}/enrollments`,
            {
              method: "POST",
              body: JSON.stringify({ studentIds: [student.id] }),
              headers: { "Content-Type": "application/json" },
            }
          ),
        );

        promises.push(
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${student.id}/history`,
            {
              method: "POST",
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
        const classInfo = allClasses?.find((c) => c.id === classId);
        const className = classInfo?.name || "Turma desconhecida";

        // Arquivar matrícula
        promises.push(
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes/${classId}/enrollments/archive`,
            {
              method: "PATCH",
              body: JSON.stringify({ studentIds: [student.id] }),
              headers: { "Content-Type": "application/json" },
            }
          )
        );

        promises.push(
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${student.id}/history`,
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
      if (hasError) throw new Error("Erro ao salvar");

      notifications.show({ message: t("notifications.success"), color: "green" });
      await mutate();
      onClose();
    } catch (err) {
      console.error(err);
      notifications.show({ message: t("notifications.error"), color: "red" });
    } finally {
      setVisible(false);
    }
  }

  if (status === "loading") return <LoadingOverlay visible />;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={t("title", { name: student.firstName })}
        size="lg"
        radius="lg"
        centered
      >
        <form
          onSubmit={handleSubmit(handleAssignClasses)}
          className="flex flex-col gap-4 p-4"
        >
          <Controller
            name="classIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label={t("fields.classes.label")}
                data={classOptions}
                {...field}
                searchable
                className="!w-full"
                nothingFoundMessage={g("notFound")}
                rightSection={<FaSearch />}
              />
            )}
          />

          <div className="p-4 border border-neutral-300 rounded-xl flex flex-col gap-2">
            {selectedClassIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Image src={notFound} alt="no-classes" className="max-w-[150px]" />
                <Text>{t("noClasses")}</Text>
              </div>
            ) : (
              selectedClassIds.map((classId) => {
                const c = allClasses?.find((cl) => cl.id === classId);
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
              {rootT("general.actions.cancel")}
            </Button>
            <Button type="submit" color="violet">
              {rootT("forms.submit")}
            </Button>
          </div>
        </form>
      </Modal>

      <LoadingOverlay visible={visible} zIndex={9999} overlayProps={{ blur: 2 }} />
    </>
  );
}

export default AssignClassesToStudent;
