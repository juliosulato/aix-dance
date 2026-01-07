"use client";

import { useEffect, useState } from "react";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { createCategoryGroup, updateCategoryGroup } from "@/actions/categoryGroups.actions";
import { CategoryGroup } from "@/types/category.types";
import { useFormAction } from "@/hooks/useFormAction"; // Importe o hook

type Props = {
  opened: boolean;
  onClose: () => void;
  selectedItem?: CategoryGroup | null;
};

const initialState = { error: undefined, errors: {} };

export default function CategoryGroupFormModal({
  opened,
  onClose,
  selectedItem,
}: Props) {
  const { state, formAction, pending } = useFormAction({
    action: selectedItem ? updateCategoryGroup : createCategoryGroup,
    initialState,
    onClose,
    successMessage: selectedItem
      ? "Grupo atualizado com sucesso!"
      : "Grupo criado com sucesso!",
  });

  const [name, setName] = useState(selectedItem?.name || "");

  useEffect(() => {
    if (opened) setName(selectedItem?.name || "");
  }, [opened, selectedItem]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={selectedItem ? "Editar Grupo" : "Novo Grupo"}
      size="md"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form action={formAction} className="flex flex-col gap-4 relative">
        {selectedItem && <input type="hidden" name="id" value={selectedItem.id} />}

        <TextInput
          id="name"
          name="name"
          label="Nome"
          placeholder="Digite Aqui"
          value={name}
          error={state.errors?.name}
          onChange={(ev) => setName(ev.target.value)}
          required
        />

        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="lg"
          loading={pending}
          className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
        >
          Salvar
        </Button>
      </form>
      <LoadingOverlay visible={pending} overlayProps={{ radius: "sm", blur: 2 }} />
    </Modal>
  );
}