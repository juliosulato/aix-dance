"use client";

import {
  Button,
  LoadingOverlay,
  Modal,
  Group,
} from "@mantine/core";
import { KeyedMutator } from "swr";
import { StudentComplete } from "@/types/student.types";

import { useStudentForm } from "@/hooks/academic/useStudentForm";

// Sub-components
import PersonalData from "./PersonalData";
import Checkboxies from "./Checkboxies";
import Guardians from "./Guardian";
import Address from "../../../AddressForm";
import AvatarUpload from "@/components/ui/AvatarUpload/AvatarUpload";

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
          <AvatarUpload
            control={control as any}
            firstName={firstName}
            initialPreview={isEditing?.image}
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

            <Button
              type="submit"
              color="#7439FA"
              radius="lg"
              loading={isPending}
            >
              {isUpdate ? "Salvar Alterações" : "Criar Aluno"}
            </Button>
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