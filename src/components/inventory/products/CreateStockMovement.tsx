import {
  createStockMovement,
  CreateStockMovementInput,
} from "@/schemas/inventory/stock-movement";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  LoadingOverlay,
  Modal,
  NumberInput,
  ScrollAreaAutosize,
  Select,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

type Props = {
  opened: boolean;
  onClose: () => void;
  productId: string;
  mutates: () => void;
};

export default function CreateStockMovement({
  opened,
  onClose,
  productId,
  mutates,
}: Props) {
  const [visible, setVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateStockMovementInput>({
    resolver: zodResolver(createStockMovement as any),
    defaultValues: {
      productId: productId,
      quantity: 1,
      type: "IN",
      reason: "",
      createdAt: dayjs().toDate(),
    },
  });

  const { data: sessionData, status } = useSession();
  if (status === "loading") return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;

  const onSubmit = async (data: CreateStockMovementInput) => {
    setVisible(true);
    try {
      // Para evitar rejeição por "data futura" devido a diferenças de relógio,
      // não enviaremos `createdAt`. O backend definirá a data.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt: _omitCreatedAt, ...payload } = data as any;
      const response = await fetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/inventory/stock-movements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na criação do movimento de estoque:", errorText);
        throw new Error("Erro ao criar movimento de estoque");
      } else {
        notifications.show({
          message: "Movimento de estoque criado com sucesso!",
          color: "green",
        });
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar movimento de estoque:", error);
      notifications.show({
        color: "red",
        message: "Erro ao criar movimento de estoque. Tente novamente.",
      });
    } finally {
      setVisible(false);
      mutates();
    }
  };

  const onError = (errors: any) => console.log("Erros de validação:", errors);

  return (
    <>
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
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
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
                    // ajusta para 1s no passado para passar na validação do backend
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
          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            fullWidth={false}
            className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
          >
            Salvar
          </Button>
        </form>
      </Modal>
      <LoadingOverlay
        visible={visible}
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
