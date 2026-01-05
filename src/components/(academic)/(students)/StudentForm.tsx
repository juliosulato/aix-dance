"use client";

import {
  Button,
  LoadingOverlay,
  Modal,
  Group,
} from "@mantine/core";
import { KeyedMutator } from "swr";
import { StudentComplete } from "@/types/student.types";

import { useStudentForm } from "@/hooks/useStudentForm";

// Sub-components
import PersonalData from "./form/PersonalData";
import Checkboxies from "./form/Checkboxies";
import Guardians from "./form/Guardian";
import StudentAvatarUpload from "./form/StudentAvatarUpload";
import Address from "../../AddressForm";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<any>;
  isEditing?: StudentComplete | null;
};

export default function StudentForm({ opened, onClose, mutate, isEditing }: Props) {
  const {
    form,
    isUpdate,
    isPending,
    avatarPreview,
    handleClose,
    handleSubmit,
  } = useStudentForm({ isEditing, onClose, mutate, opened });

  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;

  const guardians = watch("guardian");
  const firstName = watch("firstName");

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={isUpdate ? "Atualizar Aluno" : "Novo Aluno"}
        size="auto"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
        }}
        className="relative!"
        closeOnClickOutside={false}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[95vw] md:max-w-[80vw] lg:max-w-900px lg:p-6"
        >
          {/* Componente isolado para Upload de Foto */}
          <StudentAvatarUpload
            control={control as any}
            preview={avatarPreview}
            firstName={firstName}
            isUpdate={isUpdate}
          />

          <PersonalData
            control={control as any}
            register={register as any}
            errors={errors}
          />

          <Address register={register} errors={errors} />

          <Checkboxies control={control as any} errors={errors} />

          {guardians && guardians.length > 0 && (
            <Guardians control={control as any} errors={errors} />
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="#7439FA"
              radius="lg"
              loading={isPending}
            >
              {isUpdate ? "Salvar Alterações" : "Criar Aluno"}
            </Button>
          </Group>
        </form>
      </Modal>

      <LoadingOverlay
        visible={isPending}
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