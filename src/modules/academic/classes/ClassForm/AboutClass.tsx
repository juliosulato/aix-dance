"use client";

import { useState } from "react";
import { Checkbox, Select, TextInput } from "@mantine/core";
import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Modality } from "@/types/class.types";
import { User } from "@/types/user.types";
import { CreateClassInput, UpdateClassInput } from "@/schemas/academic/class.schema";
import ModalityForm from "@/modules/academic/modalities/ModalityForm";

type Props = {
  control: Control<CreateClassInput | UpdateClassInput>;
  errors: FieldErrors<CreateClassInput | UpdateClassInput>;
  tenantId: string;
  setValue: UseFormSetValue<CreateClassInput | UpdateClassInput>;
};

export default function AboutClass({ control, errors, tenantId, setValue }: Props) {
  const [openModalityModal, setOpenModalityModal] = useState(false);

  const { data: modalities, isLoading: loadingModalities, mutate: mutateModalities } = useSWR<PaginatedResponseLocal<Modality>>(
    tenantId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${tenantId}/academic/modalities` : null, 
    fetcher
  );

  const { data: teachers, isLoading: loadingTeachers } = useSWR<any>(
    tenantId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${tenantId}/users` : null, 
    fetcher
  );

  const modalitiesArray: Modality[] = Array.isArray(modalities)
    ? modalities
    : (modalities?.data.items ?? []);

  const teachersArray: User[] = Array.isArray(teachers)
    ? teachers
    : (teachers?.users ?? teachers?.products ?? teachers?.teachers ?? []);

  const modalityOptions =
    modalitiesArray.map((m) => ({
      label: m.name,
      value: m.id,
    })) || [];

  const teacherOptions =
    teachersArray.map((t) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    })) || [];

  const handleModalityCreated = async (newModality: any) => {
    // Revalidar lista de modalidades
    await mutateModalities();
    // Auto-selecionar a nova modalidade
    setValue("modalityId", newModality.id);
  };

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-lg font-bold md:col-span-full">
          Informações da Turma
        </h2>

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
                disabled={loadingModalities}
                nothingFoundMessage="Nada encontrado..."
              />
              <p className="text-xs text-neutral-500">
                Não encontrou a modalidade?{" "}
                <button
                  type="button"
                  onClick={() => setOpenModalityModal(true)}
                  className="text-primary underline hover:text-primary-dark transition-colors"
                >
                  Criar nova modalidade
                </button>
              </p>
            </div>
          )}
        />

        <Controller
          name="teacherId"
          control={control}
          render={({ field }) => (
            <Select
              label="Professor"
              placeholder="Selecione um professor"
              data={teacherOptions}
              {...field}
              error={errors.teacherId?.message}
              required
              searchable
              disabled={loadingTeachers}
              nothingFoundMessage="Nada encontrado..."
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
              disabled={loadingTeachers}
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

      {/* Modal de Modalidade - zIndex 300 para abrir sobre o modal de turma */}
      <ModalityForm
        opened={openModalityModal}
        onClose={() => setOpenModalityModal(false)}
        onSuccess={handleModalityCreated}
      />
    </>
  );
}
