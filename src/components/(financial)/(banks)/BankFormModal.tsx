"use client";

import { useState } from "react";
import {
  Button,
  LoadingOverlay,
  Modal,
  NumberInput,
  TextInput,
} from "@mantine/core";

import { createBank } from "@/actions/financial/banks.actions";
import { updateBank } from "@/actions/financial/banks.actions";
import { Bank } from "@/types/bank.types";
import { ActionState } from "@/types/server-actions.types";
import { useFormAction } from "@/hooks/useFormAction";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
type Props = {
  opened: boolean;
  onClose: () => void;
  bankToEdit?: Bank | null;
};

const initialState: ActionState<any> = {
  errors: {},
  error: undefined,
};

export default function BankFormModal({ opened, onClose, bankToEdit }: Props) {
  const isEditing = !!bankToEdit;

  const { state, formAction, pending } = useFormAction({
    action: isEditing ? updateBank : createBank,
    initialState,
    onClose,
    successMessage: isEditing
      ? "Banco atualizado com sucesso!"
      : "Banco criado com sucesso!",
  });

  const [formValues, setFormValues] = useState({
    name: bankToEdit?.name || "",
    code: bankToEdit?.code || "",
    agency: bankToEdit?.agency || "",
    account: bankToEdit?.account || "",
    description: bankToEdit?.description || "",
    maintenanceFeeAmount: bankToEdit?.maintenanceFeeAmount
      ? Number(bankToEdit.maintenanceFeeAmount)
      : undefined,
    maintenanceFeeDue: bankToEdit?.maintenanceFeeDue || undefined,
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={isEditing ? "Editar Conta Bancária" : "Nova Conta Bancária"}
        size="lg"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form action={formAction} className="flex flex-col gap-4">
          {isEditing && <input type="hidden" name="id" value={bankToEdit.id} />}

          <h2 className="text-lg font-bold">Informações Básicas</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Nome"
              placeholder="Digite o nome"
              name="name"
              required
              withAsterisk
              className="md:col-span-2"
              error={state.errors?.name}
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
            />

            <TextInput
              label="Código do Banco"
              name="code"
              placeholder="Digite o código"
              error={state.errors?.code}
              value={formValues.code}
              onChange={(e) =>
                setFormValues({ ...formValues, code: e.target.value })
              }
            />

            <TextInput
              label="Agência"
              name="agency"
              placeholder="Digite a agência"
              error={state.errors?.agency}
              value={formValues.agency}
              onChange={(e) =>
                setFormValues({ ...formValues, agency: e.target.value })
              }
            />

            <TextInput
              label="Conta"
              name="account"
              placeholder="Digite a conta"
              className="md:col-span-2"
              error={state.errors?.account}
              value={formValues.account}
              onChange={(e) =>
                setFormValues({ ...formValues, account: e.target.value })
              }
            />

            <NumberInput
              label="Taxa de Manutenção"
              name="maintenanceFeeAmount"
              placeholder="0,00"
              min={0}
              leftSection={<RiMoneyDollarCircleFill />}
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              error={state.errors?.maintenanceFeeAmount}
              value={formValues.maintenanceFeeAmount}
              onChange={(val) =>
                setFormValues({
                  ...formValues,
                  maintenanceFeeAmount: val === "" ? undefined : Number(val),
                })
              }
            />

            <NumberInput
              label="Dia de Vencimento"
              name="maintenanceFeeDue"
              placeholder="5"
              min={1}
              max={31}
              allowDecimal={false}
              error={state.errors?.maintenanceFeeDue}
              value={formValues.maintenanceFeeDue}
              onChange={(val) =>
                setFormValues({
                  ...formValues,
                  maintenanceFeeDue: val === "" ? undefined : Number(val),
                })
              }
            />

            <TextInput
              label="Descrição"
              name="description"
              className="md:col-span-2"
              error={state.errors?.description}
              value={formValues.description}
              onChange={(e) =>
                setFormValues({ ...formValues, description: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
            loading={pending}
          >
            Salvar
          </Button>
        </form>
      </Modal>
      <LoadingOverlay visible={pending} />
    </>
  );
}
