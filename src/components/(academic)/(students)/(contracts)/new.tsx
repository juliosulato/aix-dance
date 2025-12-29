"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  LoadingOverlay,
  Modal,
  Select,
  TextInput,
  Group,
  Divider,
  Alert,
} from "@mantine/core";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

import { ContractModel } from "@/types/contracts.types";
import { Student } from "@/types/student.types";
import { Tenancy } from "@/types/tenancy.types";
import {
  CreateStudentContractInput,
  createStudentContractSchema,
} from "@/schemas/academic/student-contract.schema";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import {
  extractItemsFromResponse,
  PaginatedListResponse,
} from "@/utils/pagination";
import { FaInfoCircle } from "react-icons/fa";
import RichText from "./StudentContractRichText";
import { getErrorMessage } from "@/utils/getErrorMessage";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: () => void;
  studentId: string;
};

export default function NewStudentContractModal({
  opened,
  onClose,
  mutate,
  studentId,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualVariables, setManualVariables] = useState<string[]>([]);
  const [richTextKey, setRichTextKey] = useState(Date.now()); // NOVO ESTADO: Chave para forçar a recriação
  const { data: sessionData, isPending } = useSession();
  const tenancyId = sessionData?.user.tenancyId;

  const { data: studentsResponse } = useSWR<
    Student[] | PaginatedListResponse<Student>
  >(
    tenancyId ? `/api/v1/tenancies/${tenancyId}/students?limit=500` : null,
    fetcher
  );
  const students = extractItemsFromResponse(studentsResponse);
  const { data: contractModels } = useSWR<ContractModel[]>(
    tenancyId ? `/api/v1/tenancies/${tenancyId}/contract-models` : null,
    fetcher
  );
  const { data: tenancy } = useSWR<Tenancy>(
    tenancyId ? `/api/v1/tenancies/${tenancyId}` : null,
    fetcher
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm<CreateStudentContractInput>({
    resolver: zodResolver(createStudentContractSchema),
    defaultValues: {
      studentId: studentId || "",
      contractModelId: "",
      htmlContent: "",
      manualVariables: {},
    },
  });

  const selectedContractModelId = watch("contractModelId");
  const manualVariableValues = watch("manualVariables");

  const handleClose = () => {
    reset({
      studentId: studentId || "",
      contractModelId: "",
      htmlContent: "",
      manualVariables: {},
    });
    setManualVariables([]);
    onClose();
  };

  useEffect(() => {
    if (
      studentId &&
      selectedContractModelId &&
      students &&
      contractModels &&
      tenancy
    ) {
      const student = students.find((s) => s.id === studentId);
      const model = contractModels.find(
        (m) => m.id === selectedContractModelId
      );

      if (student && model) {
        let finalHtml = model.htmlContent;
        const presets = (model as any).variablePresets || {};
        const foundManuals: string[] = [];

        Object.entries(presets).forEach(([variable, presetValue]) => {
          const regex = new RegExp(`\\{\\{${variable}\\}\\}`, "g");
          let replacement = "";

          switch (presetValue) {
            case "STUDENT_FULL_NAME":
              replacement = `${student.firstName} ${student.lastName}`;
              break;
            case "STUDENT_FIRST_NAME":
              replacement = student.firstName;
              break;
            case "STUDENT_LAST_NAME":
              replacement = student.lastName;
              break;
            case "STUDENT_EMAIL":
              replacement = student.email || "";
              break;
            case "STUDENT_PHONE":
              replacement = student.cellPhoneNumber || "";
              break;
            case "STUDENT_DOCUMENT":
              replacement = student.documentOfIdentity || "";
              break;
            case "STUDENT_BIRTH_DATE":
              replacement = student.dateOfBirth || "";
              break;
            case "TENANCY_NAME":
              replacement = tenancy.name;
              break;
            case "TENANCY_DOCUMENT":
              replacement = tenancy.document;
              break;
            case "TENANCY_EMAIL":
              replacement = tenancy.email;
              break;
            case "TENANCY_PHONE":
              replacement = tenancy.phoneNumber;
              break;
            case "CURRENT_DATE":
              replacement = new Date().toLocaleDateString("pt-BR");
              break;
            default:
              if (presetValue === "MANUAL") {
                foundManuals.push(variable);
                replacement =
                  manualVariableValues?.[variable] || `{{${variable}}}`; // Mantém a variável se vazia
              }
              break;
          }
          finalHtml = finalHtml.replace(
            regex,
            `<strong>${replacement}</strong>`
          );
        });

        setManualVariables([...new Set(foundManuals)]);
        setValue("htmlContent", finalHtml);
        setRichTextKey(Date.now()); // ATUALIZA A CHAVE: Isso força o RichText a recarregar
      }
    }
  }, [
    studentId,
    selectedContractModelId,
    students,
    contractModels,
    tenancy,
    setValue,
    manualVariableValues,
  ]);

  async function handleCreateContract(
    data: Omit<CreateStudentContractInput, "htmlContent">
  ) {
    if (!tenancyId) {
      notifications.show({
        color: "red",
        message: "Sessão inválida. Por favor, faça login novamente.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/v1/tenancies/${tenancyId}/students/${studentId}/contracts`,
        {
          method: "POST",
                credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            status: "PEDING",
          }),
        }
      );

      fetch(`/api/v1/tenancies/${tenancyId}/students/${studentId}/history`, {
        method: "POST",
                credentials: "include",
        body: JSON.stringify({
          description: `Contrato enviado para assinatura.`,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Falha ao criar o contrato. Tente novamente.");
      }

      notifications.show({
        message:
          "Contrato gerado com sucesso! Agora você pode compartilhar o link para assinatura.",
        color: "green",
      });

      mutate();
      handleClose();
    } catch (error: unknown) {
      console.error("Erro ao criar contrato:", error);

      if (error instanceof Error) {
        notifications.show({
          title: "Erro",
          message: getErrorMessage(
            error,
            "Não foi possível conectar ao servidor."
          ),
          color: "red",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Gerar Novo Contrato para Aluno"
      size="xl"
      centered
    >
      <form
        onSubmit={handleSubmit(handleCreateContract)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="contractModelId"
          control={control}
          render={({ field }) => (
            <Select
              label="Selecione o Modelo de Contrato"
              placeholder="Escolha um modelo"
              data={
                contractModels?.map((m) => ({ value: m.id, label: m.title })) ||
                []
              }
              {...field}
              error={errors.contractModelId?.message}
              required
            />
          )}
        />
        <Alert
          icon={<FaInfoCircle size={16} />}
          title="Revisão do Contrato"
          color="blue"
          radius="md"
          mt="md"
        >
          {" "}
          O contrato abaixo foi preenchido automaticamente. Reveja as
          informações antes de gerar.{" "}
        </Alert>

        {/* A key é passada aqui para forçar a recriação do componente */}
        <RichText
          key={richTextKey}
          control={control}
          onContentChange={(content) => setValue("htmlContent", content)}
        />

        {manualVariables.length > 0 && (
          <div className="mt-4">
            <Divider my="xs" label="Preenchimento de Variáveis Manuais" />
            {manualVariables.map((variable) => (
              <Controller
                key={variable}
                name={`manualVariables.${variable}` as const}
                control={control}
                render={({ field }) => (
                  <TextInput
                    label={`Valor para {{${variable}}}`}
                    placeholder={`Digite o valor para ${variable}`}
                    {...field}
                    className="mb-3"
                    required
                  />
                )}
              />
            ))}
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Gerar Contrato
          </Button>
        </Group>
      </form>
      <LoadingOverlay visible={isLoading} />
    </Modal>
  );
}
