"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, LoadingOverlay, Modal, Select, Group, Alert, Text } from '@mantine/core';
import { useSession } from "@/lib/auth-client";
import { notifications } from '@mantine/notifications';
import { ContractModel } from "@/types/contracts.types";
import { Student } from "@/types/student.types";
import { Tenancy } from "@/types/tenancy.types";
import { Plan } from '@/types/plan.types';

import { CreateStudentContractInput, createStudentContractSchema } from '@/schemas/academic/student-contract.schema';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { extractItemsFromResponse, PaginatedListResponse } from '@/utils/pagination';
import { FaInfoCircle } from 'react-icons/fa';
import RichText from './StudentContractRichText';
import { getErrorMessage } from '@/utils/getErrorMessage';

type Props = {
    opened: boolean;
    onClose: () => void;
    mutate?: () => void;
    studentId: string;
    onConfirm?: (data: { htmlContent: string; modelId: string; modelName: string }) => void;
    planContext?: Plan;
};

export default function NewStudentContractModal({ opened, onClose, mutate, studentId, onConfirm, planContext }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [richTextKey, setRichTextKey] = useState(Date.now());
    const { data: sessionData, isPending } = useSession();
    const tenancyId = sessionData?.user.tenancyId;

    const { data: studentsResponse } = useSWR<Student[] | PaginatedListResponse<Student>>(tenancyId ? `/api/v1/tenancies/${tenancyId}/students?limit=500` : null, fetcher);
    const students = extractItemsFromResponse(studentsResponse);

    // Buscar status do aluno selecionado
    const selectedStudent = students?.find(s => s.id === studentId);
    const { data: contractModels } = useSWR<ContractModel[]>(tenancyId ? `/api/v1/tenancies/${tenancyId}/contract-models` : null, fetcher);
    const { data: tenancy } = useSWR<Tenancy>(tenancyId ? `/api/v1/tenancies/${tenancyId}` : null, fetcher);

    const { handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<CreateStudentContractInput>({
        resolver: zodResolver(createStudentContractSchema),
        defaultValues: { studentId: studentId || '', contractModelId: '', htmlContent: '' },
    });

    const selectedContractModelId = watch('contractModelId');

    const handleClose = () => {
        reset({ studentId: studentId || '', contractModelId: '', htmlContent: '' });
        onClose();
    };
    
    // Efeito para substituir as variáveis quando um modelo é selecionado
    useEffect(() => {
        if (studentId && selectedContractModelId && students && contractModels && tenancy) {
            const student = students.find(s => s.id === studentId);
            const model = contractModels.find(m => m.id === selectedContractModelId);

            if (student && model) {
                let finalHtml = model.htmlContent;
                
                const studentFullName = `${student.firstName} ${student.lastName}`;
                const planMonthlyAmount = planContext ? Number(planContext.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
                
                // Objeto com todas as variáveis e seus atalhos (aliases)
                const replacements: { [key: string]: string | number | undefined | null } = {
                    // Variáveis do Aluno
                    'aluno-nome-completo': studentFullName,
                    'nome-completo': studentFullName, 
                    'aluno-primeiro-nome': student.firstName,
                    'nome': student.firstName, 
                    'aluno-sobrenome': student.lastName,
                    'sobrenome': student.lastName, 
                    'aluno-email': student.email,
                    'email': student.email, 
                    'aluno-celular': student.cellPhoneNumber,
                    'celular': student.cellPhoneNumber, 
                    'aluno-rg': student.documentOfIdentity,
                    'rg': student.documentOfIdentity, 
                    'aluno-data-nascimento': student.dateOfBirth,
                    'data-nascimento': student.dateOfBirth, 

                    // Variáveis da Empresa
                    'empresa-nome': tenancy.name,
                    'empresa': tenancy.name, 
                    'empresa-cnpj': tenancy.document,
                    'cnpj': tenancy.document, 
                    'empresa-email': tenancy.email,
                    'empresa-telefone': tenancy.phoneNumber,

                    // Variáveis do Plano
                    'plano-nome': planContext?.name,
                    'plano-valor-mensal': planMonthlyAmount,

                    // Variáveis Gerais
                    'data-atual-extenso': new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }),
                };

                // Itera sobre o objeto de substituições e aplica cada uma no HTML
                Object.entries(replacements).forEach(([variable, value]) => {
                    if (value !== null && value !== undefined) {
                        const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
                        finalHtml = finalHtml.replace(regex, `<strong>${value}</strong>`);
                    }
                });

                setValue('htmlContent', finalHtml);
                setRichTextKey(Date.now()); 
            }
        }
    }, [studentId, selectedContractModelId, students, contractModels, tenancy, setValue, planContext]);


    async function onSubmit(data: CreateStudentContractInput) {
        if (onConfirm) {
            const model = contractModels?.find(m => m.id === data.contractModelId);
            onConfirm({
                htmlContent: data.htmlContent || "",
                modelId: data.contractModelId,
                modelName: model?.title || 'Contrato Personalizado',
            });
            handleClose();
            return;
        }

        if (!tenancyId || !mutate) {
            notifications.show({ color: "red", message: "Configuração inválida para criar contrato." });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${studentId}/contracts`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, status: "PEDING" }),
            });
            
            if (!response.ok) throw new Error("Falha ao criar o contrato. Tente novamente.");

            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${studentId}/history`,{
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ description: `Contrato enviado para assinatura.` }),
                headers: { "Content-Type": "application/json" },
            });

            notifications.show({ message: "Contrato gerado com sucesso!", color: "green" });
            mutate();
            handleClose();

        } catch (error: unknown) {
            console.error("Erro ao criar contrato:", error);
            notifications.show({ title: "Erro", message: getErrorMessage(error, "Erro ao criar contrato."), color: "red" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal opened={opened} onClose={handleClose} title="Adicionar/Editar Contrato" size="xl" centered>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Controller name="contractModelId" control={control} render={({ field }) => (<Select label="Selecione o Modelo de Contrato" placeholder="Escolha um modelo" data={contractModels?.map(m => ({ value: m.id, label: m.title })) || []} {...field} error={errors.contractModelId?.message} required />)} />
                <Alert icon={<FaInfoCircle size={16} />} title="Revisão do Contrato" color="blue" radius="md" mt="md"> O contrato abaixo foi preenchido automaticamente. Reveja as informações antes de gerar. </Alert>

                {/* Alerta de bloqueio acadêmico */}
                {selectedStudent && selectedStudent.active === false && (
                    <Alert icon={<FaInfoCircle size={16} />} title="Ação Bloqueada" color="red" radius="md" mt="md">
                        <Text size="sm">
                            Este aluno está <strong>inativo</strong> devido a pendências financeiras. Não é possível gerar novos contratos enquanto o status estiver bloqueado.
                        </Text>
                    </Alert>
                )}

                <RichText key={richTextKey} control={control} onContentChange={(content) => setValue('htmlContent', content)} />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" loading={isLoading} disabled={selectedStudent && selectedStudent.active === false}>
                        {selectedStudent && selectedStudent.active === false ? "Ação Bloqueada" : (onConfirm ? "Confirmar Contrato" : "Gerar Contrato")}
                    </Button>
                </Group>
            </form>
            <LoadingOverlay visible={isLoading} />
        </Modal>
    );
}

