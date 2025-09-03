"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, ScrollArea } from "@mantine/core";
import { BillStatus, BillType } from "@prisma/client";

import { CreateBillInput, getCreateBillSchema } from "@/schemas/financial/bill.schema";
import NewBill__BasicInformations from "./basic-informations";
import NewBill__Relations from "./relations";
import NewBill__Recurrence from "./recurrence";

type Props = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function NewBill({ opened, onClose, onSuccess }: Props) {
    const t = useTranslations("financial.bills.modals.create");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);

    const createBillSchema = getCreateBillSchema((key: string) => t(key as any));

    const { control, handleSubmit, formState: { errors }, register, reset } = useForm<CreateBillInput>({
        resolver: zodResolver(createBillSchema) as any,
        defaultValues: {
            type: BillType.RECEIVABLE,
            description: "",
            amount: 0,
            dueDate: new Date(),
            status: BillStatus.PENDING,
            installments: 1,
            studentId: null,
            supplierId: null,
            categoryId: null,
            paymentMethodId: null,
            bankId: null,
        }
    });

    const { data: sessionData } = useSession();

    async function createBill(data: CreateBillInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bills`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to create bill");

            notifications.show({ message: t("notifications.success"), color: "green" });
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({ message: t("notifications.error"), color: "red" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (err: any) => {
        console.warn("Validation errors:", err);
        notifications.show({
            title: g("errors.validationTitle"),
            message: g("errors.validationMessage"),
            color: 'yellow'
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("title")}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createBill, handleFormErrors)}>
                <LoadingOverlay visible={isLoading} />
                <ScrollArea.Autosize mah="70vh" type="always">
                    <div className="flex flex-col gap-4 p-1">
                        <NewBill__BasicInformations control={control} register={register} errors={errors} />
                        <NewBill__Relations control={control} tenancyId={sessionData?.user.tenancyId || ""} />
                        <NewBill__Recurrence control={control} register={register} />
                    </div>
                </ScrollArea.Autosize>
                <div className="flex justify-end pt-4 mt-2 border-t border-t-neutral-300">
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="md"
                        loading={isLoading}
                        className="!text-sm !font-medium tracking-wider"
                    >
                        {g("forms.submit")}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
