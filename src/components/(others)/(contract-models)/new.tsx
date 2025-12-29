"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  LoadingOverlay,
  Modal,
  Select,
  TextInput,
  Group,
  Text,
  Divider,
  Alert,
} from "@mantine/core";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import {
  contractModelSchema,
  ContractModelInput,
  presetOptions,
} from "@/schemas/others/contract-models.schema";
import RichText from "@/components/(others)/(contract-models)/rich-text";
import { MutatorCallback } from "swr";
import { BsInfoCircle } from "react-icons/bs";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: MutatorCallback;
};

export default function NewContractModelModal({
  opened,
  onClose,
  mutate,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const { data: sessionData, isPending } = useSession();

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm<ContractModelInput>({
    resolver: zodResolver(contractModelSchema),
    defaultValues: {
      title: "",
      htmlContent: "",
      variablePresets: {},
    },
  });

  const handleClose = () => {
    reset();
    setVariables([]);
    onClose();
  };

  const groupedSelectOptions = useMemo(() => {
    if (!Array.isArray(presetOptions)) return [];

    const groups: {
      [key: string]: {
        group: string;
        items: { value: string; label: string }[];
      };
    } = {};

    presetOptions.forEach((option) => {
      if (!groups[option.group]) {
        groups[option.group] = {
          group: option.group,
          items: [],
        };
      }
      groups[option.group].items.push({
        value: option.value,
        label: option.label,
      });
    });

    return Object.values(groups);
  }, []);

  const handleContentChange = (content: string) => {
    const regex = /\{\{([\w-]+)\}\}/g;
    const matches = [...content.matchAll(regex)];
    const foundVariables = matches.map((match) => match[1]);
    const uniqueVariables = [...new Set(foundVariables)];
    setVariables(uniqueVariables);

    const currentPresets = watch("variablePresets") || {};
    const newPresets: { [key: string]: string } = {};
    uniqueVariables.forEach((v) => {
      newPresets[v] = currentPresets[v] || "MANUAL";
    });
    setValue("variablePresets", newPresets);
  };

  async function handleCreateContractModel(data: ContractModelInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/contract-models`,
        {
          method: "POST",
                credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Falha ao criar o modelo");

      notifications.show({
        message: "Modelo de contrato criado com sucesso!",
        color: "green",
      });
      mutate();
      handleClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        message: "Erro ao criar modelo de contrato.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Criar Novo Modelo de Contrato"
      size="xl"
      radius="lg"
      centered
    >
      <form
        onSubmit={handleSubmit(handleCreateContractModel)}
        className="flex flex-col gap-4"
      >
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

        <Alert
          icon={<BsInfoCircle size={16} />}
          title="Como usar as variáveis?"
          color="blue"
          variant="light"
          className="mt-4"
        >
          Para definir uma variável, digite o texto desejado entre chaves
          duplas. Por exemplo:{" "}
          <Text component="span" fw={700}>
            {"{{nome-aluno}}"}
          </Text>
          . As variáveis detectadas aparecerão abaixo para configuração.
        </Alert>

        {variables.length > 0 && (
          <div className="mt-4">
            <Divider
              my="xs"
              label="Configuração das Variáveis"
              labelPosition="center"
            />
            <Text size="sm" c="dimmed" mb="md">
              Para cada variável encontrada no texto, defina um valor padrão de
              preenchimento.
            </Text>
            <div className="flex flex-col gap-3">
              {variables.map((variable) => (
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
          <Button variant="default" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Salvar Modelo
          </Button>
        </Group>
      </form>
      <LoadingOverlay visible={isLoading} />
    </Modal>
  );
}
