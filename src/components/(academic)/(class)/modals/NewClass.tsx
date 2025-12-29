"use client";

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import "dayjs/locale/pt-br";
import { useState } from "react";
import AboutOfClass from "./aboutOfClass";
import DayOfClassesAndHours from "./dayOfClassAndHours";
import NewClass__Students from "./students";
import NewClass__Resume from "./resume";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import {
  CreateClassInput,
  createClassSchema,
} from "@/schemas/academic/class.schema";
import { KeyedMutator } from "swr";
import { DayOfWeek } from "@/types/class.types";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<any>;
};

function NewClass({ opened, onClose, mutate }: Props) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  const classSchema = createClassSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    trigger,
  } = useForm<CreateClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      online: false,
      students: [],
      schedules: {
        sunday: { enabled: false, ranges: [{ from: "", to: "" }] },
        monday: { enabled: false, ranges: [{ from: "", to: "" }] },
        tuesday: { enabled: false, ranges: [{ from: "", to: "" }] },
        wednesday: { enabled: false, ranges: [{ from: "", to: "" }] },
        thursday: { enabled: false, ranges: [{ from: "", to: "" }] },
        friday: { enabled: false, ranges: [{ from: "", to: "" }] },
        saturday: { enabled: false, ranges: [{ from: "", to: "" }] },
      },
    },
    mode: "onTouched", // 'onTouched' é geralmente melhor para performance que 'onChange'
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CreateClassInput)[] = [];
    if (active === 0) {
      fieldsToValidate = ["name", "modalityId", "teacherId", "schedules"];
    } else if (active === 1) {
      fieldsToValidate = ["students"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const { data: sessionData, isPending } = useSession();
  if (isPending) return <LoadingOverlay visible />;

  async function createClass(data: CreateClassInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setVisible(true);

    // Transforma 'schedules' em 'days' para o backend
    const daysPayload = Object.entries(data.schedules)
      .filter(
        ([, day]) => day.enabled && day.ranges.some((r) => r.from && r.to)
      )
      .flatMap(([dayKey, day]) =>
        day.ranges
          .filter((range) => range.from && range.to) // Garante que apenas ranges completos sejam enviados
          .map((range) => ({
            dayOfWeek: dayKey.toUpperCase() as keyof typeof DayOfWeek,
            initialHour: range.from,
            endHour: range.to,
          }))
      );

    const finalData = { ...data, days: daysPayload };

    try {
      const resp = await fetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/classes`,
        {
          method: "POST",
            credentials: "include",
          body: JSON.stringify(finalData),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!resp.ok) throw new Error("Erro ao criar turma");
      notifications.show({
        message: "Turma criada com sucesso",
        color: "green",
      });
      reset();
      setActive(0);
      mutate();
      onClose();
    } catch (err) {
      console.error(err);
      notifications.show({ color: "red", message: "Erro ao criar turma" });
    } finally {
      setVisible(false);
    }
  }

  return sessionData && (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={"Criar Turma"}
        size="auto"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form
          onSubmit={handleSubmit(createClass)}
          className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6"
        >
          <Stepper active={active} onStepClick={setActive}>
            <Stepper.Step label={"Sobre a Turma"}>
              <div className="flex flex-col gap-4">
                <AboutOfClass
                  control={control as any}
                  errors={errors}
                  tenancyId={sessionData.user.tenancyId}
                />
                <DayOfClassesAndHours
                  watch={watch}
                  setValue={setValue as any}
                  errors={errors}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    color="#7439FA"
                    radius={"lg"}
                    size="md"
                    onClick={handleNextStep}
                  >
                    {"Próximo"}
                  </Button>
                </div>
              </div>
            </Stepper.Step>
            <Stepper.Step label={"Alunos"}>
              <div className="flex flex-col gap-4">
                <NewClass__Students
                  control={control as any}
                  errors={errors}
                  tenancyId={sessionData.user.tenancyId}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    color="#7439FA"
                    radius={"lg"}
                    size="lg"
                    onClick={prevStep}
                  >
                    {"Voltar"}
                  </Button>
                  <Button
                    type="button"
                    color="#7439FA"
                    radius={"lg"}
                    size="lg"
                    onClick={handleNextStep}
                  >
                    {"Próximo"}
                  </Button>
                </div>
              </div>
            </Stepper.Step>
            <Stepper.Step label={"Resumo"}>
              <div className="flex flex-col gap-4">
                <NewClass__Resume
                  control={control as any}
                  tenancyId={sessionData.user.tenancyId}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    color="#7439FA"
                    radius={"lg"}
                    size="lg"
                    onClick={prevStep}
                  >
                    {"Voltar"}
                  </Button>
                  <Button type="submit" color="#7439FA" radius={"lg"} size="lg">
                    {"Salvar"}
                  </Button>
                </div>
              </div>
            </Stepper.Step>
          </Stepper>
        </form>
      </Modal>
      <LoadingOverlay
        visible={visible}
        zIndex={9999}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "violet", type: "dots" }}
        pos="fixed"
        h="100vh"
        w="100vw"
      />
    </>
  );
}

export default NewClass;
