"use client";

import { useActionState, useEffect, useState } from "react";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { ActionState } from "@/types/server-actions.types";
import { CreateCategoryGroupInput } from "@/schemas/financial/category-group.schema";
import { createCategoryGroup } from "@/actions/financial/categoryGroups/create";
import { notifications } from "@mantine/notifications";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const initialState: ActionState<CreateCategoryGroupInput> = {
  error: undefined,
  errors: {
    name: undefined,
  },
};

export default function NewCategoryGroup({ opened, onClose }: Props) {
  const [state, formAction, pending] = useActionState(
    createCategoryGroup,
    initialState
  );

  const [formValues, setFormValues] = useState<{
    name: string;
  }>({ name: "" });

  useEffect(() => {
    if (state.success) {
      notifications.show({
        title: "Sucesso",
        message: "Grupo criado com sucesso!",
        color: "green",
      });
    }
  }, [state.success, onClose]);

  useEffect(() => {
    if (!opened) {
      setFormValues({
        name: "",
      });
    }
  }, [opened]);

  useEffect(() => {
    if (state.error) {
      notifications.show({
        title: "Erro",
        message: state.error,
        color: "red",
      });
    }
  }, [state.error]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Novo Grupo"
      size="md"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form action={formAction} className="flex flex-col gap-4">
        <TextInput
          id="name"
          name="name"
          label={"Nome"}
          placeholder={"Digite Aqui"}
          value={formValues.name}
          error={state.errors?.name}
          onChange={(ev) => setFormValues({ name: ev.target.value })}
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
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
