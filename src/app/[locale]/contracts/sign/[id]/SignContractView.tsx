"use client"; // SOLUÇÃO 1: Adiciona a diretiva para marcar como Componente de Cliente

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, LoadingOverlay, TextInput, Group, Alert, Paper, Text, Divider, Center, InputBase } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { StudentContract, Tenancy } from '@prisma/client';
import { FaCheckCircle, FaExclamationTriangle, FaFileSignature } from 'react-icons/fa';
import { SignatureInput, signatureSchema } from '@/schemas/academic/student-contract-signature.schema';
import { IMaskInput } from 'react-imask';
import dayjs from 'dayjs';
import "dayjs/locale/pt-br";
dayjs.locale('pt-br');

// Interface para garantir que os dados relacionados (aluno, tenancy) estão incluídos
interface ContractWithRelations extends StudentContract {
    student: {
        firstName: string;
        lastName: string;
        tenancy: Tenancy;
    };
}

type Props = {
    contract: ContractWithRelations;
    ipAddress: string;
    location: {
        city: string;
        country: string;
    };
};

export default function SignContractView({ contract, ipAddress, location }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSigned, setIsSigned] = useState(contract.status === 'SIGNED');

    const { handleSubmit, formState: { errors }, control } = useForm<SignatureInput>({
        resolver: zodResolver(signatureSchema),
    });

    async function handleSignContract(data: SignatureInput) {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${contract.student.tenancy.id}/contracts/sign/${contract.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    ...location,
                    ipAddress,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao assinar o contrato.');
            }

            notifications.show({
                title: 'Sucesso!',
                message: 'Contrato assinado com sucesso.',
                color: 'green',
                icon: <FaCheckCircle />,
            });
            setIsSigned(true);

        } catch (error: any) {
            notifications.show({
                title: 'Erro',
                message: error.message,
                color: 'red',
                icon: <FaExclamationTriangle />,
            });
        } finally {
            setIsLoading(false);
        }
    }

    // SOLUÇÃO 2: Adiciona verificações para evitar que a página quebre se os dados estiverem incompletos
    if (!contract?.student || !contract?.student.tenancy) {
        return (
            <Center style={{ height: '100vh', padding: '2rem' }}>
                <Alert color="red" title="Erro ao Carregar Contrato">
                    Não foi possível carregar todas as informações do contrato. Por favor, verifique o link ou entre em contato com a academia.
                </Alert>
            </Center>
        );
    }
    
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Paper shadow="lg" p="xl" radius="lg" withBorder className="max-w-4xl w-full">
                <LoadingOverlay visible={isLoading} />
                
                <div className="text-center mb-6">
                    <FaFileSignature className="mx-auto text-4xl text-primary mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Assinatura de Contrato</h1>
                    <p className="text-gray-500">
                        Contrato entre <strong>{contract.student.firstName} {contract.student.lastName}</strong> e <strong>{contract.student.tenancy.name}</strong>
                    </p>
                </div>

                <div
                    className="prose max-w-none p-4 border rounded-lg bg-gray-50 mb-6 max-h-[50vh] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: contract.htmlContent }}
                />

                {isSigned ? (
                    <Alert icon={<FaCheckCircle size={20} />} title="Contrato Assinado" color="teal" variant="light" radius="md">
                        <Text>Este contrato foi assinado em <strong>{dayjs().format("DD [de] MMMM [de] YYYY")}</strong>.</Text>
                        <Text size="sm" c="dimmed">Obrigado! Um registro desta assinatura foi enviado para a administração.</Text>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit(handleSignContract)} className="flex flex-col gap-4">
                        <Divider my="md" label="Confirmação de Assinatura" labelPosition="center" />
                        <Text size="sm" ta="center" c="dimmed">
                            Para validar a assinatura, por favor, preencha os campos abaixo. Ao clicar em "Assinar Contrato", você concorda com todos os termos e condições descritos acima.
                        </Text>
                        <Controller
                            name="fullName"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Nome Completo do Assinante"
                                    placeholder="Digite seu nome completo"
                                    {...field}
                                    error={errors.fullName?.message}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="document"
                            control={control}
                            render={({ field }) => (
                                <InputBase
                                    component={IMaskInput}
                                    mask="000.000.000-00"
                                    label="CPF"
                                    placeholder="Digite seu CPF"
                                    {...field}
                                    error={errors.document?.message}
                                    required
                                  
                                />
                            )}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button type="submit" loading={isLoading} size="lg" leftSection={<FaFileSignature />}>
                                Assinar Contrato
                            </Button>
                        </Group>
                    </form>
                )}
            </Paper>
        </main>
    );
}

