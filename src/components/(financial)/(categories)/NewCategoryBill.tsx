"use client";

import {
  Button,
  LoadingOverlay,
  Modal,
  Select,
  TextInput,
} from "@mantine/core";
import { useActionState, useEffect, useState } from "react";
import { createCategoryBill } from "@/actions/financial/categoryBills/create";
import { CreateBankInput } from "@/schemas/financial/bank.schema";
import { ActionState } from "@/types/server-actions.types";
import {
  BillCategoryType,
  BillNature,
  CategoryBill,
  CategoryGroup,
} from "@/types/category.types";
import { notifications } from "@mantine/notifications";

type Props = {
  opened: boolean;
  onClose: () => void;
  categoryGroups: CategoryGroup[];
  parentCategories: CategoryBill[];
};

const initialState: ActionState<CreateBankInput> = {
  error: undefined,
  errors: {
    name: undefined,
    account: undefined,
    agency: undefined,
    code: undefined,
    description: undefined,
    maintenanceFeeAmount: undefined,
    maintenanceFeeDue: undefined,
  },
};

export default function NewCategoryBill({
  opened,
  onClose,
  categoryGroups,
  parentCategories,
}: Props) {
  const [state, formAction, pending] = useActionState(
    createCategoryBill,
    initialState
  );

  const [formValues, setFormValues] = useState({
    name: "",
    nature: "",
    type: "",
    groupId: "",
    parentId: "",
  });

  useEffect(() => {
    if (state.success) {
      notifications.show({
        title: "Sucesso",
        message: "Categoria criada com sucesso!",
        color: "green",
      });
    }
  }, [state.success, onClose]);

  useEffect(() => {
    if (!opened) {
      setFormValues({
        name: "",
        nature: "",
        type: "",
        groupId: "",
        parentId: "",
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
      title="Nova Categoria"
      size="lg"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form className="flex flex-col gap-4" action={formAction}>
        <div className="rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            id="name"
            name="name"
            label="Nome"
            value={formValues.name}
            required
            error={state.errors?.name}
            className="md:col-span-2"
          />

          <Select
            id="nature"
            name="nature"
            label="Natureza"
            placeholder="Selecione a natureza"
            value={formValues.nature}
            data={[
              { label: "Receita", value: BillNature.REVENUE },
              { label: "Despesa", value: BillNature.EXPENSE },
            ]}
            error={state.errors?.nature}
            required
          />

          <Select
            name="type"
            id="type"
            label="Tipo"
            placeholder="Selecione o tipo"
            value={formValues.type}
            data={[
              { label: "Fixo", value: BillCategoryType.FIXED },
              { label: "Variável", value: BillCategoryType.VARIABLE },
            ]}
            error={state.errors?.type}
            required
          />
          <Select
            id="groupId"
            name="groupId"
            label="Grupo"
            placeholder="Selecione o grupo"
            value={formValues.groupId}
            data={categoryGroups?.map((g) => ({ label: g.name, value: g.id })) || []}
            searchable
            clearable
            nothingFoundMessage={"Nenhum grupo encontrado"}
            className="md:col-span-2"
          />

          <Select
            id="parentId"
            name="parentId"
            label={"Categoria Ascendente"}
            placeholder={"Selecione a categoria ascendente"}
            value={formValues.parentId}
            data={
              parentCategories?.map((p) => ({ label: p.name, value: p.id })) ||
              []
            }
            error={state.errors?.parentId}
            searchable
            clearable
            nothingFoundMessage="Nenhuma categoria encontrada"
            className="md:col-span-2"
          />
        </div>
        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="md"
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
