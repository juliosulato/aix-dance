import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { useSession } from "@/lib/auth-client";
import { IconX, IconCheck } from "@tabler/icons-react";

import {
  CreateModalityInput,
  createModalitySchema,
} from "@/schemas/academic/modality.schema";
import { saveModality } from "@/actions/academic/modality.actions";
import { AppError } from "@/lib/AppError";

export type ModalityFormData = {
  id: string;
  name: string;
};

interface UseModalityFormProps {
  isEditing?: ModalityFormData | null;
  onClose: () => void;
  onSuccess?: (modality: any) => void;
  opened: boolean;
}

export function useModalityForm({
  isEditing,
  onClose,
  onSuccess,
  opened,
}: UseModalityFormProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const isUpdate = !!isEditing;

  const form = useForm<CreateModalityInput>({
    resolver: zodResolver(createModalitySchema),
    defaultValues: {
      name: "",
    },
    mode: "onTouched",
  });

  const { reset } = form;

  useEffect(() => {
    if (!opened) return;

    if (isUpdate && isEditing) {
      reset({
        name: isEditing.name,
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [opened, isUpdate, isEditing, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateModalityInput) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        
        if (isUpdate && isEditing) {
          formData.append("id", isEditing.id);
        }

        const result = await saveModality(formData);

        if (!result.success) {
          throw new AppError(result.error || "Erro ao salvar modalidade", "MODALITY_SAVE_ERROR");
        }

        notifications.show({
          icon: <IconCheck color="#12B886" />,
          title: "Sucesso",
          message: `Modalidade ${isUpdate ? "atualizada" : "criada"} com sucesso!`,
          color: "green",
        });

        reset();
        onSuccess?.(data);
        onClose();
      } catch (error) {
        console.error("Erro ao salvar modalidade:", error);
        notifications.show({
          icon: <IconX color="#FB8282" />,
          title: "Erro",
          message:
            error instanceof Error
              ? error.message
              : `Erro ao ${isUpdate ? "atualizar" : "criar"} modalidade`,
          color: "red",
        });
      }
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  return {
    form,
    isUpdate,
    isPending,
    handleClose,
    handleSubmit,
    session,
  };
}
