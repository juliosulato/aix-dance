"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, LoadingOverlay, Modal, Select, TextInput, Group, Text, Divider, Alert } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';import { authedFetch } from "@/utils/authedFetch";import { ContractModel } from '@prisma/client';
import { MutatorCallback } from 'swr';
import { contractModelSchema, ContractModelInput, presetOptions } from '@/schemas/others/contract-models.schema'; 
import RichText from './rich-text';
import { BsInfoCircle } from 'react-icons/bs';

type Props = {
    opened: boolean;
    onClose: () => void;
    contractModel: ContractModel;
    mutate: MutatorCallback;
};

export default function UpdateContractModelModal({ opened, onClose, contractModel, mutate }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [variables, setVariables] = useState<string[]>([]);
    const { data: sessionData } = useSession();

    const { handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<ContractModelInput>({
        resolver: zodResolver(contractModelSchema),
        defaultValues: {
            title: contractModel?.title || '',
            htmlContent: contractModel?.htmlContent || '',
            variablePresets: (contractModel as any)?.variablePresets || {}
        }
    });
    
    // CORREÇÃO: Transformando os dados para o formato que o Mantine Select espera
    const groupedSelectOptions = useMemo(() => {
        if (!Array.isArray(presetOptions)) return [];

        const groups: { [key: string]: { group: string; items: { value: string; label: string }[] } } = {};

        presetOptions.forEach(option => {
            if (!groups[option.group]) {
                groups[option.group] = {
                    group: option.group,
                    items: [],
                };
            }
            groups[option.group].items.push({ value: option.value, label: option.label });
        });

        return Object.values(groups);
    }, []);


    useEffect(() => {
        if (contractModel) {
            const initialContent = contractModel.htmlContent || '';
            reset({
                title: contractModel.title,
                htmlContent: initialContent,
                variablePresets: (contractModel as any).variablePresets || {}
            });
            handleContentChange(initialContent);
        }
    }, [contractModel, reset]);
    
    const handleContentChange = (content: string) => {
        if (typeof content !== 'string') return;
        const regex = /\{\{([\w-]+)\}\}/g;
        const matches = [...content.matchAll(regex)];
        const foundVariables = matches.map(match => match[1]);
        const uniqueVariables = [...new Set(foundVariables)];
        setVariables(uniqueVariables);

        const currentPresets = watch('variablePresets') || {};
        const newPresets: { [key: string]: string } = {};
        uniqueVariables.forEach(v => {
            newPresets[v] = currentPresets[v] || 'MANUAL';
        });
        setValue('variablePresets', newPresets);
    };

    async function handleUpdateContractModel(data: ContractModelInput) {
        if (!sessionData?.user.tenancyId) {
            notifications.show({ color: "red", message: "Sessão inválida" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authedFetch(`/api/v1/tenancies/${sessionData.user.tenancyId}/contract-models/${contractModel.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Falha ao atualizar o modelo");

            notifications.show({
                message: "Modelo de contrato atualizado com sucesso!",
                color: "green"
            });
            mutate();
            onClose();
        } catch (error) {
            console.error(error);
            notifications.show({
                message: "Erro ao atualizar modelo de contrato.",
                color: "red"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Editar Modelo de Contrato"
            size="xl"
            radius="lg"
            centered
        >
            <form onSubmit={handleSubmit(handleUpdateContractModel)} className="flex flex-col gap-4">
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <TextInput
                            label="Título do Modelo"
                            placeholder="Ex: Contrato Padrão - Aulas de Dança"
                            {...field}
                            error={errors.title?.message}
                            required
                        />
                    )}
                />

                <RichText control={control} onContentChange={handleContentChange} />

                <Alert icon={<BsInfoCircle size={16} />} title="Como usar as variáveis?" color="blue" variant="light" className='mt-4'>
                    Para definir uma variável, digite o texto desejado entre chaves duplas.
                    Por exemplo: <Text component='span' fw={700}>{'{{nome-aluno}}'}</Text>.
                    As variáveis detectadas aparecerão abaixo para configuração.
                </Alert>

                {Array.isArray(variables) && variables.length > 0 && (
                    <div className='mt-4'>
                        <Divider my="xs" label="Configuração das Variáveis" labelPosition="center" />
                        <Text size="sm" c="dimmed" mb="md">
                            Para cada variável encontrada no texto, defina um valor padrão de preenchimento.
                        </Text>
                        <div className='flex flex-col gap-3'>
                        {variables.map(variable => (
                            <Controller
                                key={variable}
                                name={`variablePresets.${variable}` as const}
                                control={control}
                                defaultValue="MANUAL"
                                render={({ field }) => (
                                    <Select
                                        label={`Valor para {{${variable}}}`}
                                        data={groupedSelectOptions}
                                        {...field}
                                    />
                                )}
                            />
                        ))}
                        </div>
                    </div>
                )}
                
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={isLoading}>Salvar Alterações</Button>
                </Group>
            </form>
            <LoadingOverlay visible={isLoading} />
        </Modal>
    );
}

