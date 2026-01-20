import { createStockMovement, CreateStockMovementInput } from "@/schemas/inventory/stock-movement";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, LoadingOverlay, Modal, NumberInput, ScrollAreaAutosize, Select, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { useFormAction } from "@/hooks/useFormAction";
import { BiInfoCircle } from "react-icons/bi";
import { buildPayload } from "@/utils/server-utils";
import { createStockMovementAction } from "@/actions/inventory/stockMovements.actions";

type Props = {
  opened: boolean;
  onClose: () => void;
  productId: string;
};

const initialState = { error: undefined, errors: {} };

export default function CreateStockMovement({
  opened,
  onClose,
  productId,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateStockMovementInput>({
    resolver: zodResolver(createStockMovement),
    defaultValues: {
      productId,
      quantity: 1,
      createdAt: new Date()
    }
  });

  const { formAction, pending, state } = useFormAction<CreateStockMovementInput, CreateStockMovementInput>({
    action: createStockMovementAction,
    initialState,
    onClose,
    successMessage: "Movimento de estoque criado com sucesso!",
  });

  const handleSave = (data: CreateStockMovementInput) => {
    console.log(data);
    formAction({
      ...data,
      productId
    });
  };

  const onError = (errors: FieldErrors<CreateStockMovementInput>) =>
    console.log("Erros de validação:", errors);

  return (
    <Modal
      onClose={() => {
        reset();
        onClose();
      }}
      opened={opened}
      title="Novo Movimento de Estoque"
      size="xl"
      radius="lg"
      centered
      scrollAreaComponent={ScrollAreaAutosize}
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form onSubmit={handleSubmit(handleSave, onError)} className="space-y-4">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Tipo de Movimento"
              data={[
                { value: "IN", label: "Entrada" },
                { value: "OUT", label: "Saída" },
                { value: "BALANCE", label: "Balanço" },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Quantidade"
              value={field.value}
              onChange={field.onChange}
              error={errors.quantity?.message}
            />
          )}
        />

        <Textarea
          label="Observações"
          {...register("reason")}
          error={errors.reason?.message}
          minRows={3}
          maxRows={6}
          maxLength={255}
        />

        <Controller
          name="createdAt"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value as Date | undefined}
              label="Data do Movimento"
              onChange={(val) => {
                const now = new Date();
                const dateVal = val ? new Date(val) : null;
                if (dateVal && dateVal.getTime() > now.getTime()) {
                  field.onChange(new Date(now.getTime() - 1000));
                } else {
                  field.onChange(dateVal);
                }
              }}
              error={errors.createdAt?.message}
              maxDate={new Date()}
            />
          )}
        />
        {state.error && <Alert color="red" icon={<BiInfoCircle/>}>{state.error}</Alert>}
        <Button
          type="submit"
          color="#7439FA"
          radius="lg"
          size="lg"
          fullWidth={false}
          className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
        >
          Salvar
        </Button>
      </form>
      <LoadingOverlay visible={pending} />
    </Modal>
  );
}
