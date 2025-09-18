"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { Button, LoadingOverlay, Modal, ScrollArea, Tabs } from "@mantine/core";
import { Bill, BillStatus, BillType } from "@prisma/client";

import { CreateBillInput, getCreateBillSchema } from "@/schemas/financial/bill.schema";
import BasicInformations from "./basic-informations";
import Subscription from "./subscription";
import CashOrInstallments from "./cash-or-installments";
import { KeyedMutator } from "swr";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Bill[]>;
};

export default function NewBill({ opened, onClose, mutate }: Props) {
    const t = useTranslations("financial.bills.modals");
    const g = useTranslations("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>('cash-or-installments');

    const createBillSchema = getCreateBillSchema((key: string) => t(key as any));

    const { control, handleSubmit, formState: { errors }, register, reset, watch, setValue } = useForm<CreateBillInput>({
        resolver: zodResolver(createBillSchema) as any,
        defaultValues: {
            type: BillType.PAYABLE,
            description: "",
            amount: 0,
            status: BillStatus.PENDING,
            supplierId: null,
            categoryId: null,
            bankId: null,

            paymentMode: 'INSTALLMENTS', 
            installments: 1,
            dueDate: new Date(),
        }
    });
    
    // Update paymentMode when tab changes to ensure validation targets the correct schema
    const handleTabChange = (value: string | null) => {
        setActiveTab(value);
        if (value === 'cash-or-installments') {
            setValue('paymentMode', 'INSTALLMENTS');
        } else if (value === 'subscription') {
            setValue('paymentMode', 'SUBSCRIPTION');
            // Set default values for the subscription tab when switched to
            setValue('endCondition', 'noDateSet');
        }
    };

    const { data: sessionData } = useSession();

    // The 'data' parameter is now correctly typed as CreateBillInput, resolving the error.
    async function createBill(data: CreateBillInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: g("errors.invalidSession") });
            return;
        }

        setIsLoading(true);
        try {
            console.log("Submitting data:", data);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bills`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error("Failed to create bill");
            }

            notifications.show({ message: t("create.notifications.success"), color: "green" });
            reset();
            onClose();
            mutate();
        } catch (error) {
            console.error(error);
            notifications.show({ message: t("create.notifications.error"), color: "red" });
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
    
    const formControlProps = { control, errors, register, watch, setValue };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t("create.title")}
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createBill, handleFormErrors)}>
                <LoadingOverlay visible={isLoading} />
                <ScrollArea.Autosize mah="70vh" type="always" p="xs">
                    <div className="space-y-6">
                        <BasicInformations  {...formControlProps as any}/>
                        
                        <div>
                            <h2 className="text-lg font-semibold mb-2">{t("section2-title")}</h2>
                            <Tabs value={activeTab} onChange={handleTabChange} color="#7439FA" variant="pills" radius="lg" classNames={{ tab: "!p-4 md:!px-6 !font-semibold"}}>
                                <Tabs.List>
                                    <Tabs.Tab value="cash-or-installments">{t("tabs.cash-or-installments")}</Tabs.Tab>
                                    <Tabs.Tab value="subscription">{t("tabs.subscription")}</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="cash-or-installments" pt="xs">
                                    <CashOrInstallments {...formControlProps as any}/>
                                </Tabs.Panel>

                                <Tabs.Panel value="subscription" pt="xs">
                                    <Subscription {...formControlProps as any}/>
                                </Tabs.Panel>
                            </Tabs>
                        </div>
                    </div>
                </ScrollArea.Autosize>
                
                <div className="flex justify-end pt-6">
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

