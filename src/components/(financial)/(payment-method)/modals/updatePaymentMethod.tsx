import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { UpdatePaymentMethodInput, getUpdatePaymentMethodSchema } from "@/schemas/financial/payment-method.schema";
import { PaymentMethod } from "..";
import { KeyedMutator } from "swr";
import PaymentMethod__BasicInformations from "./basic-informations";
import PaymentMethod__Fees from "./feeForm";

type Props = {
  paymentMethod: PaymentMethod | null;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mutate: () => void | KeyedMutator<PaymentMethod[]>;
};

export default function UpdatePaymentMethod({ mutate, paymentMethod, opened, onClose, onSuccess }: Props) {
  const t = useTranslations("financial.paymentMethods.modals");
  const g = useTranslations("");
  const [isLoading, setIsLoading] = useState(false);

  const updatePaymentMethodSchema = getUpdatePaymentMethodSchema((key: string) => t(key as any));

  const { control, handleSubmit, formState: { errors }, register, reset } =
    useForm<UpdatePaymentMethodInput>({
      resolver: zodResolver(updatePaymentMethodSchema) as any,
      defaultValues: { // inicial vazio
        name: undefined,
        operator: undefined,
        fees: [],
      },
    });

  // 👉 Atualiza os valores do formulário sempre que mudar o `paymentMethod`
  useEffect(() => {
    if (paymentMethod) {
      reset({
        name: paymentMethod.name,
        operator: paymentMethod.operator ?? undefined,
        fees: paymentMethod.fees.map((fee) => ({
          customerInterest: fee.customerInterest,
          feePercentage: fee.feePercentage,
          maxInstallments: fee.maxInstallments,
          minInstallments: fee.minInstallments,
          receiveInDays: fee.receiveInDays ?? undefined,
        })),
      });
    }
  }, [paymentMethod, reset]);

  const { data: sessionData } = useSession();

  async function updatePaymentMethod(data: UpdatePaymentMethodInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: g("errors.invalidSession") });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/payment-methods/${paymentMethod?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data }),
        }
      );
      if (!response.ok) throw new Error("Failed to update payment method");
      notifications.show({ message: t("content.notifications.success"), color: "green" });
      if (onSuccess) onSuccess();
      onClose();
      mutate()
    } catch (error) {
      console.error(error);
      notifications.show({ message: t("content.notifications.error"), color: "red" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("update.title")}
      size="xl"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}
    >
      <form
        onSubmit={handleSubmit(updatePaymentMethod)}
        className="flex flex-col gap-4"
      >
        <LoadingOverlay visible={isLoading} />
        <PaymentMethod__BasicInformations register={register} errors={errors} />
        <PaymentMethod__Fees control={control} register={register} errors={errors} />
        <Button
          type="submit"
          loading={isLoading}
          color="#7439FA"
          radius="lg"
          size="md"
          className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
        >
          {g("forms.submit")}
        </Button>
      </form>
    </Modal>
  );
}
