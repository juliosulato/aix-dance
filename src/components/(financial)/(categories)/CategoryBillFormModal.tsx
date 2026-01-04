"use client";
import { useEffect, useState } from "react";
import { Button, LoadingOverlay, Modal, Select, TextInput } from "@mantine/core";
import { createCategoryBill } from "@/actions/financial/categoryBills/create";
import { updateCategoryBill } from "@/actions/financial/categoryBills/update";
import { BillCategoryType, BillNature, CategoryBill, CategoryGroup } from "@/types/category.types";
import { useFormAction } from "@/hooks/useFormAction";

type Props = {
  opened: boolean;
  onClose: () => void;
  categoryGroups: CategoryGroup[];
  parentCategories: CategoryBill[];
  categoryToEdit?: CategoryBill | null;
};

const initialState = { error: undefined, errors: {} };

export default function CategoryBillFormModal({
  opened,
  onClose,
  categoryGroups,
  parentCategories,
  categoryToEdit,
}: Props) {
  
  const { state, formAction, pending } = useFormAction({
    action: categoryToEdit ? updateCategoryBill : createCategoryBill,
    initialState,
    onClose,
    successMessage: categoryToEdit
      ? "Categoria atualizada com sucesso!"
      : "Categoria criada com sucesso!",
  });

  const [formValues, setFormValues] = useState({
    name: categoryToEdit?.name || "",
    nature: categoryToEdit?.nature || "",
    type: categoryToEdit?.type || "",
    groupId: categoryToEdit?.groupId || "",
    parentId: categoryToEdit?.parentId || "",
  });

  useEffect(() => {
    if (opened) {
      setFormValues({
        name: categoryToEdit?.name || "",
        nature: categoryToEdit?.nature || "",
        type: categoryToEdit?.type || "",
        groupId: categoryToEdit?.groupId || "",
        parentId: categoryToEdit?.parentId || "",
      });
    }
  }, [opened, categoryToEdit]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
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
          
          {categoryToEdit && (
            <input type="hidden" name="id" value={categoryToEdit.id} />
          )}

          <TextInput
            id="name"
            name="name"
            label="Nome"
            value={formValues.name}
            onChange={(ev) =>
              setFormValues({ ...formValues, name: ev.currentTarget.value })
            }
            required
            error={state.errors?.name}
            className="md:col-span-2"
          />

          <Select
            id="nature"
            name="nature"
            label="Natureza"
            clearable={false}
            placeholder="Selecione a natureza"
            value={formValues.nature}
            onChange={(ev) =>
              setFormValues({
                ...formValues,
                nature: (ev as BillNature) || BillNature.REVENUE,
              })
            }
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
            onChange={(ev) =>
              setFormValues({
                ...formValues,
                type: (ev as BillCategoryType) || BillCategoryType.FIXED,
              })
            }
            error={state.errors?.type}
            required
          />

          <Select
            id="groupId"
            name="groupId"
            label="Grupo"
            placeholder="Selecione o grupo"
            value={formValues.groupId}
            onChange={(val) => 
               setFormValues({ ...formValues, groupId: val || "" })
            }
            data={
              categoryGroups?.map((g) => ({ label: g.name, value: g.id })) || []
            }
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
            onChange={(val) => 
               setFormValues({ ...formValues, parentId: val || "" })
            }
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