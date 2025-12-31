"use client";

import { useActionState, useEffect, useState } from "react";
import { Button, LoadingOverlay, Modal, Alert } from "@mantine/core";
import { CreateBankInput } from "@/schemas/financial/bank.schema";
import { createBank } from "@/actions/financial/banks/create";
import { ActionState } from "@/types/server-actions.types";
import { NumberInput, TextInput } from "@mantine/core";
import { RiMoneyDollarCircleFill, RiErrorWarningFill } from "react-icons/ri";
import { notifications } from "@mantine/notifications";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const initialState: ActionState<CreateBankInput> = {
  errors: {
    name: undefined,
    code: undefined,
    agency: undefined,
    account: undefined,
    description: undefined,
    maintenanceFeeAmount: undefined,
    maintenanceFeeDue: undefined,
  },
  error: undefined,
};

export default function NewBankAccount({ opened, onClose }: Props) {
  const [state, formAction, pending] = useActionState(createBank, initialState);

  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    agency: "",
    account: "",
    description: "",
    maintenanceFeeAmount: undefined as string | number | undefined,
    maintenanceFeeDue: undefined as string | number | undefined,
  });

  useEffect(() => {
    if (state.success) {
      notifications.show({
        title: "Sucesso",
        message: "Conta bancária criada com sucesso!",
        color: "green",
      });
      window.location.reload();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    if (!opened) {
        setFormValues({
            name: "",
            code: "",
            agency: "",
            account: "",
            description: "",
            maintenanceFeeAmount: undefined,
            maintenanceFeeDue: undefined,
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
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Nova Conta Bancária"
        size="lg"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form action={formAction} className="flex flex-col gap-4">

          <h2 className="text-lg font-bold">
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label={"Nome"}
              placeholder={"Digite o nome"}
              name="name"
              required
              withAsterisk
              className="md:col-span-2"
              error={state.errors?.name}
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            />

            <TextInput
              label={"Código do Banco"}
              name="code"
              placeholder={"Digite o código do banco"}
              error={state.errors?.code}
              value={formValues.code}
              onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
            />

            <TextInput
              label={"Agência"}
              name="agency"
              placeholder={"Digite a agência"}
              error={state.errors?.agency}
              value={formValues.agency}
              onChange={(e) => setFormValues({ ...formValues, agency: e.target.value })}
            />

            <TextInput
              label={"Conta"}
              name="account"
              placeholder={"Digite a conta"}
              className="md:col-span-2"
              error={state.errors?.account}
              value={formValues.account}
              onChange={(e) => setFormValues({ ...formValues, account: e.target.value })}
            />

            <NumberInput
              label={"Taxa de Manutenção"}
              name="maintenanceFeeAmount"
              placeholder="0,00"
              error={state.errors?.maintenanceFeeAmount}
              min={0}
              leftSection={<RiMoneyDollarCircleFill />}
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              value={formValues.maintenanceFeeAmount}
              onChange={(val) => setFormValues({ ...formValues, maintenanceFeeAmount: val })}
            />

            <NumberInput
              min={1}
              max={31}
              allowDecimal={false}
              placeholder="5"
              error={state.errors?.maintenanceFeeDue}
              label={"Dia de Vencimento da Taxa de Manutenção"}
              name="maintenanceFeeDue"
              value={formValues.maintenanceFeeDue}
              onChange={(val) => setFormValues({ ...formValues, maintenanceFeeDue: val })}
            />
            <TextInput
              label={"Descrição"}
              name="description"
              error={state.errors?.description}
              className="md:col-span-2"
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
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