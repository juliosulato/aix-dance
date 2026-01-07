import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { KeyedMutator } from "swr";
import { useSession } from "@/lib/auth-client";

import {
  CreateStudentInput,
  createStudentSchema,
  UpdateStudentInput,
  updateStudentSchema,
} from "@/schemas/academic/student.schema";
import { createStudent, updateStudent } from "@/actions/student";
import { StudentComplete } from "@/types/student.types";
import { ZodType } from "zod";
import { AppError } from "@/lib/AppError";
import { IconX, IconCheck } from '@tabler/icons-react';

interface UseStudentFormProps {
  isEditing?: StudentComplete | null;
  onClose: () => void;
  mutate: KeyedMutator<any>;
  opened: boolean;
}

export function useStudentForm({
  isEditing,
  onClose,
  mutate,
  opened,
}: UseStudentFormProps) {
  const { data: sessionData } = useSession();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isUpdate = !!isEditing;

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(
      isUpdate
        ? updateStudentSchema
        : (createStudentSchema as ZodType<
            CreateStudentInput | UpdateStudentInput,
            any,
            any
          >)
    ),
    defaultValues: {
      guardian: [],
      healthProblems: "",
      medicalAdvice: "",
      painOrDiscomfort: "",
      canLeaveAlone: true,
      address: {
        country: "Brasil"
      }
    },
    mode: "onChange"
  });

  const { reset, watch } = form;
  const currentFile = watch("file");

  useEffect(() => {
    if (currentFile instanceof File) {
      const objectUrl = URL.createObjectURL(currentFile);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [currentFile]);

  useEffect(() => {
    if (!opened) return;

    if (isUpdate && isEditing) {
      reset({
        firstName: isEditing.firstName,
        lastName: isEditing.lastName,
        gender: isEditing.gender,
        cellPhoneNumber: isEditing.cellPhoneNumber,
        dateOfBirth: isEditing.dateOfBirth,
        documentOfIdentity: isEditing.documentOfIdentity ?? "",
        email: isEditing.email ?? "",
        phoneNumber: isEditing.phoneNumber ?? "",
        pronoun: isEditing.pronoun ?? "",
        healthProblems: isEditing.healthProblems ?? "",
        medicalAdvice: isEditing.medicalAdvice ?? "",
        painOrDiscomfort: isEditing.painOrDiscomfort ?? "",
        canLeaveAlone: isEditing.canLeaveAlone ?? true,
        howDidYouMeetUs: isEditing.howDidYouMeetUs ?? "",
        instagramUser: isEditing.instagramUser ?? "",
        address: isEditing.address
          ? {
              zipCode: isEditing.address.zipCode ?? "",
              publicPlace: isEditing.address.publicPlace ?? "",
              number: isEditing.address.number ?? "",
              complement: isEditing.address.complement ?? "",
              neighborhood: isEditing.address.neighborhood ?? "",
              city: isEditing.address.city ?? "",
              state: isEditing.address.state ?? "",
              country: isEditing.address.country ?? ""
            }
          : undefined,
        guardian:
          isEditing.guardian?.map((g) => ({
            firstName: g.firstName,
            lastName: g.lastName,
            cellPhoneNumber: g.cellPhoneNumber,
            email: g.email ?? "",
            phoneNumber: g.phoneNumber ?? "",
            relationship: g.relationShip || "",
            documentOfIdentity: g.documentOfIdentity ?? "",
          })) ?? [],
      });
    } else {
      reset({
        guardian: [],
        healthProblems: "",
        medicalAdvice: "",
        painOrDiscomfort: "",
        canLeaveAlone: true,
      });
      setAvatarPreview(null);
    }
  }, [opened, isUpdate, isEditing, reset]);

  const handleClose = () => {
    reset();
    setAvatarPreview(null);
    onClose();
  };

  const onSubmit = async (data: CreateStudentInput) => {
    if (!sessionData?.user) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const k = key as keyof CreateStudentInput;
      const value = data[k];

      if (
        value !== undefined &&
        value !== null &&
        k !== "address" &&
        k !== "guardian" &&
        k !== "file"
      ) {
        formData.append(k, String(value));
      }
    });

    if (data.address) {
      formData.append("address", JSON.stringify(data.address));
    }
    if (data.guardian) {
      formData.append("guardian", JSON.stringify(data.guardian));
    }

    if (data.file instanceof File) {
      formData.append("file", data.file);
    }

    startTransition(async () => {
      try {
        let result;

        if (isUpdate && isEditing?.id) {
          result = await updateStudent(formData, isEditing.id);
        } else {
          result = await createStudent(formData);
        }

        if (!result.success) {
        console.error("Erro retornado pela Server Action:", result);

          throw new AppError(
            result.error || `Erro ao ${isUpdate ? "atualizar" : "criar"} aluno`, "500"
          );
        }

        notifications.show({
          icon: <IconCheck  fill="#12B886"/>,
          message: `Aluno ${isUpdate ? "atualizado" : "criado"} com sucesso!`,
          color: "green",
        });

        mutate();
        handleClose();
      } catch (error) {
        console.error(error);
        notifications.show({
          icon: <IconX color="#FB8282"/>,
          title: "Erro",
          message:
            error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado.",
          color: "red",
        });
      }
    });
  };

  const onInvalid = (errors: any) => {
    console.log("Erros de validação:", errors);

    const getFirstErrorMessage = (errorNode: any): string | undefined => {
      if (!errorNode) return undefined;

      if (errorNode.message && typeof errorNode.message === "string") {
        return errorNode.message;
      }

      if (typeof errorNode === "object") {
        for (const key of Object.keys(errorNode)) {
          if (key === "ref" || key === "type") continue;

          const nestedMessage = getFirstErrorMessage(errorNode[key]);
          if (nestedMessage) return nestedMessage;
        }
      }

      return undefined;
    };

    const firstError = getFirstErrorMessage(errors);

    notifications.show({
      icon: <IconX fill="#FB8282"/>,
      title: "Dados inválidos",
      message:
        firstError ||
        "Verifique os campos obrigatórios destacados em vermelho.",
      color: "red",
    });
  };

  return {
    form,
    isUpdate,
    isPending,
    avatarPreview,
    handleClose,
    handleSubmit: form.handleSubmit(onSubmit, onInvalid),
  };
}
