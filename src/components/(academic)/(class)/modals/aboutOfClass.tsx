"use client";

import { Checkbox, Select, TextInput } from "@mantine/core";
import Link from "next/link";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import { Control, Controller, FieldErrors } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Modality, User } from "@prisma/client";

type Props = {
    control: Control<CreateClassInput | UpdateClassInput>;
    errors: FieldErrors<CreateClassInput | UpdateClassInput>;
    tenancyId: string;
};

export default function NewClass__AboutOfClass({ control, errors, tenancyId }: Props) {
    const { data: modalities } = useSWR<Modality[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/modalities` : null,
        fetcher
    );
    const { data: teachers } = useSWR<User[]>(
        () => tenancyId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users?role=TEACHER` : null,
        fetcher
    );

    const modalityOptions = modalities?.map((m) => ({ label: m.name, value: m.id })) || [];
    const teacherOptions = teachers?.map((t) => ({ label: `${t.firstName} ${t.lastName}`, value: t.id })) || [];

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <h2 className="text-lg font-bold md:col-span-full">Informações da Turma</h2>
            
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <TextInput
                        label="Nome da turma"
                        placeholder="Digite o nome da turma"
                        {...field}
                        error={errors.name?.message}
                        required
                    />
                )}
            />

            <Controller
                name="modalityId"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-1">
                        <Select
                            label="Modalidade"
                            placeholder="Selecione a modalidade"
                            data={modalityOptions}
                            {...field}
                            error={errors.modalityId?.message}
                            required
                            searchable
                            nothingFoundMessage={"Nada encontrado..."}
                        />
                        <p className="text-xs text-neutral-500">Não encontrou a modalidade? <Link className="text-primary underline" href={"/system/academic/modalities"}>Criar nova modalidade</Link></p>
                    </div>
                )}
            />

            <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Professor"
                        data={teacherOptions}
                        {...field}
                        error={errors.teacherId?.message}
                        required
                        searchable
                        nothingFoundMessage={"Nada encontrado..."}
                    />
                )}
            />

            <Controller
                name="assistantId"
                control={control}
                render={({ field }) => (
                    <Select
                        label="Professor assistente"
                        placeholder="Selecione um professor assistente (opcional)"
                        data={teacherOptions}
                        {...field}
                        error={errors.assistantId?.message}
                        searchable
                        clearable
                        nothingFoundMessage="Nada encontrado"
                    />
                )}
            />
            
            <Controller
                name="online"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        checked={field.value || false}
                        onChange={(event) => field.onChange(event.currentTarget.checked)}
                        label="Turma online"
                        className="md:col-span-full mt-4"
                    />
                )}
            />
        </div>
    );
}

