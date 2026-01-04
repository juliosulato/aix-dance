"use client";

import { Button, LoadingOverlay, Modal,  NumberInput, Select } from "@mantine/core";
import { BillComplete, BillStatus } from "@/types/bill.types";
import { KeyedMutator } from "swr";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { DateInput } from "@mantine/dates";
import { useActionState, useEffect, useState } from "react";
import { PayBillInput } from "@/schemas/financial/bill.schema";
import { updateBill } from "@/actions/financial/bills/update";
import { ActionState } from "@/types/server-actions.types";
import { Bank } from "@/types/bank.types";
import { notifications } from "@mantine/notifications";
import Decimal from "decimal.js";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate?: KeyedMutator<BillComplete[]>;
  bill: BillComplete;
  banks: Bank[];
};

const initialState: ActionState<PayBillInput> = {
  success: false,
  error: undefined,
  errors: {},
};

export default function PayBill({
  opened,
  onClose,
  mutate,
  bill,
  banks,
}: Props) {
  const [state, formAction, pending] = useActionState(updateBill, initialState);

  const [formValues, setFormValues] = useState<{
    paymentDate: Date | null;
    amountPaid: number;
    status: BillStatus | null;
    bankId: string | null;
  } >({
    paymentDate: bill.paymentDate ?? new Date(),
    amountPaid: bill?.amountPaid instanceof Decimal ? bill?.amountPaid?.toNumber() : bill.amount instanceof Decimal ? bill?.amount?.toNumber() : bill.amount ?? 0,
    status: BillStatus.PAID,
    bankId: bill?.bankId,
  });
  
    useEffect(() => {
      if (!opened) {
        setFormValues({
            amountPaid: 0,
            bankId: null,
            paymentDate: null,
            status: null
        })
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

  useEffect(() => {
    if (state.success) {
        mutate?.();
        onClose();
        notifications.show({
          message: "Forma de recebimento criada com sucesso",
          color: "green",
        });
    }
  }, [state.success])

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Pagar Conta"
      size="md"
      radius="md"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form action={formAction}>
        <LoadingOverlay visible={pending} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="id" value={bill.id} />
            <DateInput
              id="paymentDate"
              name="paymentDate"
              label="Data de pagamento"
              value={formValues?.paymentDate}
              valueFormat="DD/MM/YYYY"
              onChange={(date) => {
                if (!date) {
                  setFormValues({ ...formValues, paymentDate: new Date() });
                  return;
                }

                const newDate = dayjs(date)
                  .hour(12)
                  .minute(0)
                  .second(0)
                  .toDate();

                setFormValues({ ...formValues, paymentDate: newDate });
              }}
              error={state?.errors?.paymentDate}
              locale={"pt-br"}
              required
              className="w-full"
            />

            <NumberInput
              id="amountPaid"
              name="amountPaid"
              label="Valor pago"
              value={formValues?.amountPaid}
              onChange={(ev) =>
                setFormValues({ ...formValues, amountPaid: Number(ev) })
              }
              error={state.errors?.amountPaid}
              leftSection={<RiMoneyDollarCircleFill />}
              allowDecimal
              decimalSeparator=","
              thousandSeparator="."
              min={0}
              required
            />

            <Select
              label="Status"
              id="status"
              name="status"
              data={[
                { value: BillStatus.PAID, label: "Pago" },
                { value: BillStatus.PENDING, label: "Pendente" },
                { value: BillStatus.OVERDUE, label: "Vencido" },
                { value: BillStatus.CANCELLED, label: "Cancelado" },
              ]}
              value={formValues?.status}
              onChange={(ev) =>
                setFormValues({
                  ...formValues,
                  status: ev as BillStatus,
                })
              }
              error={state.errors?.status}
              required
              className="md:col-span-2"
            />

            <Select
              label="Recebeu no banco"
              value={formValues?.bankId}
              onChange={(ev) => setFormValues({ ...formValues, bankId: ev })}
              error={state?.errors?.bankId}
              searchable
              clearable
              data={
                banks?.map((bank) => ({
                  label: bank.name,
                  value: bank.id,
                })) || []
              }
              placeholder="Selecione um banco"
              className="md:col-span-2"
            />
          </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-neutral-200">
          <Button type="submit" loading={pending}>
            Pagar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
