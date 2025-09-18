import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { UpdateFormsOfReceiptInput, getUpdateFormsOfReceiptSchema } from "@/schemas/financial/forms-receipt.schema";
import { FormsOfReceipt } from "..";
import { KeyedMutator } from "swr";
import FormsOfReceipt__BasicInformations from "./basic-informations";
import FormsOfReceipt__Fees from "./feeForm";

type Props = {
  formsOfReceipt: FormsOfReceipt | null;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mutate: () => void | KeyedMutator<FormsOfReceipt[]>;
};

export default function UpdateFormsOfReceipt({ mutate, formsOfReceipt, opened, onClose, onSuccess }: Props) {
  const t = useTranslations("financial.payment-methods.modals");
  const g = useTranslations("");
  const [isLoading, setIsLoading] = useState(false);

  const updateFormsOfReceiptSchema = getUpdateFormsOfReceiptSchema((key: string) => t(key as any));

  const { control, handleSubmit, formState: { errors }, register, reset } =
    useForm<UpdateFormsOfReceiptInput>({
      resolver: zodResolver(updateFormsOfReceiptSchema) as any,
      defaultValues: { // inicial vazio
        name: undefined,
        operator: undefined,
        fees: [],
      },
    });

  // 👉 Atualiza os valores do formulário sempre que mudar o `formsOfReceipt`
  useEffect(() => {
    if (formsOfReceipt) {
      reset({
        name: formsOfReceipt.name,
        operator: formsOfReceipt.operator ?? undefined,
        fees: formsOfReceipt.fees.map((fee) => ({
          customerInterest: fee.customerInterest,
          feePercentage: fee.feePercentage,
          maxInstallments: fee.maxInstallments,
          minInstallments: fee.minInstallments,
          receiveInDays: fee.receiveInDays ?? undefined,
        })),
      });
    }
  }, [formsOfReceipt, reset]);

  const { data: sessionData } = useSession();

  async function updateFormsOfReceipt(data: UpdateFormsOfReceiptInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: g("errors.invalidSession") });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/forms-of-receipt/${formsOfReceipt?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data }),
        }
      );
      if (!response.ok) throw new Error("Failed to update forms of receipt");
      notifications.show({ message: t("update.notifications.success"), color: "green" });
      if (onSuccess) onSuccess();
      onClose();
      mutate()
    } catch (error) {
      console.error(error);
      notifications.show({ message: t("update.notifications.error"), color: "red" });
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
        onSubmit={handleSubmit(updateFormsOfReceipt)}
        className="flex flex-col gap-4"
      >
        <LoadingOverlay visible={isLoading} />
        <FormsOfReceipt__BasicInformations register={register} errors={errors} />
        <FormsOfReceipt__Fees control={control} register={register} errors={errors} />
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
