"use client";

import { Button, LoadingOverlay, Modal, Stepper } from "@mantine/core";
import { KeyedMutator } from "swr";
import {
  useClassForm,
  type ClassFormData,
} from "@/hooks/academic/useClassForm";

import AboutClass from "./AboutClass";
import DaySchedules from "./DaySchedules";
import ClassStudents from "./ClassStudents";
import ClassSummary from "./ClassSummary";
import { Control } from "react-hook-form";
import {
  CreateClassInput,
  UpdateClassInput,
} from "@/schemas/academic/class.schema";

type Props = {
  opened: boolean;
  onClose: () => void;
  isEditing?: ClassFormData | null;
};

export default function ClassForm({
  opened,
  onClose,
  isEditing,
}: Props) {
  const {
    form,
    isUpdate,
    isPending,
    activeStep,
    handleClose,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    session,
  } = useClassForm({ isEditing, onClose, opened });

  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  if (!session?.user) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isUpdate ? "Atualizar Turma" : "Criar Turma"}
      size="auto"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
      closeOnClickOutside={false}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6"
      >
        <Stepper active={activeStep}>
          <Stepper.Step label="Sobre a Turma">
            <div className="flex flex-col gap-4">
              <AboutClass
                control={
                  control as Control<CreateClassInput | UpdateClassInput>
                }
                errors={errors}
                tenantId={session.user.tenantId}
                setValue={setValue as any}
              />
              <DaySchedules
                watch={watch as any}
                setValue={setValue as any}
                errors={errors}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  color="#7439FA"
                  radius="lg"
                  size="md"
                  onClick={handleNextStep}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Step label="Alunos">
            <div className="flex flex-col gap-4">
              <ClassStudents
                control={
                  control as Control<CreateClassInput | UpdateClassInput>
                }
                errors={errors}
                tenantId={session.user.tenantId}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  color="#7439FA"
                  radius="lg"
                  size="lg"
                  onClick={handlePrevStep}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  color="#7439FA"
                  radius="lg"
                  size="lg"
                  onClick={handleNextStep}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Step label="Resumo">
            <div className="flex flex-col gap-4">
              <ClassSummary
                control={
                  control as Control<CreateClassInput | UpdateClassInput>
                }
                tenantId={session.user.tenantId}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  color="#7439FA"
                  radius="lg"
                  size="lg"
                  onClick={handlePrevStep}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  color="#7439FA"
                  radius="lg"
                  size="lg"
                  loading={isPending}
                >
                  {isUpdate ? "Salvar Alterações" : "Criar Turma"}
                </Button>
              </div>
            </div>
          </Stepper.Step>
        </Stepper>
      </form>
      <LoadingOverlay visible={isPending} />
    </Modal>
  );
}
