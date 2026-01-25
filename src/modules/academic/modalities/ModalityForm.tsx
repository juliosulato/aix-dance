"use client";

import { Button, Modal, TextInput } from "@mantine/core";
import {
  useModalityForm,
  type ModalityFormData,
} from "@/hooks/academic/useModalityForm";
import { Controller } from "react-hook-form";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess?: (modality: any) => void;
  isEditing?: ModalityFormData | null;
};

export default function ModalityForm({
  opened,
  onClose,
  onSuccess,
  isEditing,
}: Props) {
  const { form, isUpdate, isPending, handleClose, handleSubmit, session } =
    useModalityForm({ isEditing, onClose, onSuccess, opened });

  const {
    control,
    formState: { errors },
  } = form;

  if (!session?.user) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isUpdate ? "Atualizar Modalidade" : "Nova Modalidade"}
      size="md"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
      zIndex={300}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Nome da Modalidade"
              placeholder="Ex: Ballet Clássico, Jazz, etc."
              {...field}
              error={errors.name?.message}
              required
            />
          )}
        />

        <div className="flex justify-end gap-1 mt-4">
          <Button
            type="button"
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" color="#7439FA" loading={isPending}>
            {isUpdate ? "Atualizar" : "Criar"} Modalidade
          </Button>
        </div>
      </form>
    </Modal>
  );
}
