"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import { Button, LoadingOverlay, Modal, Tabs } from "@mantine/core";

import { CreateBillInput, createBillSchema } from "@/schemas/financial/bill.schema";
import BasicInformations from "./basic-informations";
import Subscription from "./subscription";
import CashOrInstallments from "./cash-or-installments";
import FileUpload, { UploadedFile } from "@/components/FileUpload";
import { KeyedMutator } from "swr";
import { Bill, BillStatus, BillType } from "@/types/bill.types";
import { ZodType } from "zod";

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate: KeyedMutator<Bill[]>;
};

export default function NewBill({ opened, onClose, mutate }: Props) {

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>('cash-or-installments');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);


    const { control, handleSubmit, formState: { errors }, register, reset, watch, setValue } = useForm<CreateBillInput>({
        resolver: zodResolver(createBillSchema as ZodType<CreateBillInput, any, any>),
        defaultValues: {
            type: BillType.PAYABLE,
            description: "",
            amount: 0,
            status: BillStatus.PENDING,
            supplierId: undefined,
            categoryId: undefined,
            bankId: undefined,
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
            // setValue('endCondition', 'endDate'); // Default para subscription
        }
    };

    const { data: sessionData, isPending } = useSession();

    // The 'data' parameter is now correctly typed as CreateBillInput, resolving the error.
    async function createBill(data: CreateBillInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            console.log("Submitting data:", data);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bills`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error("Failed to create bill");
            }

            const createdBill = await response.json();
            notifications.show({ message: "Conta criada com sucesso", color: "green" });
            reset();
            onClose();
            // Persistir anexos, se houver
            if (uploadedFiles.length > 0) {
                try {
                    for (const f of uploadedFiles) {
                        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/bill-attachments`, {
                            method: "POST",
                credentials: "include",
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: f.fileUrl, billId: createdBill.id }),
                        });
                    }
                } catch (err) {
                    console.error('Erro ao salvar anexos', err);
                }
            }
            mutate();
        } catch (error) {
            console.error(error);
            notifications.show({ message: "Falha ao criar conta", color: "red" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormErrors = (err: any) => {
        console.warn("Validation errors:", err);
        notifications.show({
            title: "Erro de validação",
            message: "Verifique os dados informados",
            color: 'yellow'
        });
    };
    
    const formControlProps = { control, errors, register, watch, setValue };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Nova Conta"
            size="xl"
            radius="lg"
            centered
            classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300" }}
        >
            <form onSubmit={handleSubmit(createBill, handleFormErrors)}>
                <LoadingOverlay visible={isLoading} />
                    <div className="space-y-6">
                        <BasicInformations  {...formControlProps as any}/>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Anexos</h3>
                            <FileUpload
                                accept={undefined}
                                multiple
                                uploadPathPrefix="financial/bill-attachments"
                                onComplete={(files) => setUploadedFiles(files)}
                            />
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Opções de Pagamento</h2>
                            <Tabs value={activeTab} onChange={handleTabChange} color="#7439FA" variant="pills" radius="lg" classNames={{ tab: "!p-4 md:!px-6 !font-semibold"}}>
                                <Tabs.List>
                                    <Tabs.Tab value="cash-or-installments">Pagamento à vista / Parcelado</Tabs.Tab>
                                    <Tabs.Tab value="subscription">Assinatura / Recorrência</Tabs.Tab>
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
                
                <div className="flex justify-end pt-6">
                    <Button
                        type="submit"
                        color="#7439FA"
                        radius="lg"
                        size="md"
                        loading={isLoading}
                        className="text-sm! font-medium! tracking-wider"
                    >
                        Salvar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

