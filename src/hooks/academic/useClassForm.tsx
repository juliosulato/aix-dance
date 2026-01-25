import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { KeyedMutator } from "swr";
import { useSession } from "@/lib/auth-client";
import { IconX, IconCheck } from "@tabler/icons-react";

import {
  CreateClassInput,
  createClassSchema,
  DAYS_OF_WEEK,
} from "@/schemas/academic/class.schema";
import { saveClass } from "@/actions/academic/class.actions";
import { AppError } from "@/lib/AppError";

export type ClassFormData = {
  id: string;
  name: string;
  modalityId: string;
  teacherId: string;
  assistantId?: string | null;
  online: boolean;
  days?: Array<{
    dayOfWeek: DAYS_OF_WEEK;
    initialHour: string;
    endHour: string;
  }>;
  studentClasses?: Array<{ id: string; studentId: string }>;
};

interface UseClassFormProps {
  isEditing?: ClassFormData | null;
  onClose: () => void;
  opened: boolean;
}

export function useClassForm({
  isEditing,
  onClose,
  opened,
}: UseClassFormProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [activeStep, setActiveStep] = useState(0);

  const isUpdate = !!isEditing;

  const form = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema) as any,
    defaultValues: {
      name: "",
      modalityId: "",
      teacherId: "",
      online: false,
      students: [],
      days: [],
    },
    mode: "onTouched",
  });

  const { reset, trigger } = form;

  useEffect(() => {
    if (!opened) return;

    if (isUpdate && isEditing) {
      reset({
        name: isEditing.name,
        modalityId: isEditing.modalityId,
        teacherId: isEditing.teacherId,
        assistantId: isEditing.assistantId ?? undefined,
        online: isEditing.online,
        students:
          isEditing.studentClasses?.map((sc) => sc.studentId || sc.id) ?? [],
        days: isEditing.days || [],
      });
    } else {
      reset({
        online: false,
        students: [],
        days: [],
      });
    }
    setActiveStep(0);
  }, [opened, isUpdate, isEditing, reset]);

  /**
   * Handle modal close - resets form and step
   */
  const handleClose = () => {
    reset();
    setActiveStep(0);
    onClose();
  };

  /**
   * Navigate to next step with validation
   */
  const handleNextStep = async () => {
    let fieldsToValidate: Array<keyof CreateClassInput> = [];

    if (activeStep === 0) {
      fieldsToValidate = ["name", "modalityId", "teacherId", "days"];
    } else if (activeStep === 1) {
      fieldsToValidate = ["students"];
    }

    const isValid = await trigger(fieldsToValidate as any);

    if (isValid) {
      setActiveStep((current) => Math.min(current + 1, 2));
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevStep = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateClassInput) => {
    if (!session?.user) {
      notifications.show({
        icon: <IconX color="#FB8282" />,
        message: "Sessão inválida",
        color: "red",
      });
      return;
    }

    const formData = new FormData();

    // Add all fields except days and students
    Object.keys(data).forEach((key) => {
      const k = key as keyof typeof data;
      const value = data[k];

      if (
        value !== undefined &&
        value !== null &&
        k !== "days" &&
        k !== "students"
      ) {
        formData.append(k, String(value));
      }
    });

    // Add days and students as JSON
    if (data.days) {
      formData.append("days", JSON.stringify(data.days));
    }
    if (data.students) {
      formData.append("students", JSON.stringify(data.students));
    }

    // Add ID for update
    if (isUpdate && isEditing?.id) {
      formData.append("id", isEditing.id);
    }

    startTransition(async () => {
      try {
        const result = await saveClass(formData);

        if (!result.success) {
          throw new AppError(
            result.error || `Erro ao ${isUpdate ? "atualizar" : "criar"} turma`,
            "500"
          );
        }

        notifications.show({
          icon: <IconCheck fill="#12B886" />,
          message: `Turma ${isUpdate ? "atualizada" : "criada"} com sucesso!`,
          color: "green",
        });

        handleClose();
      } catch (error) {
        console.error(error);
        notifications.show({
          icon: <IconX color="#FB8282" />,
          title: "Erro",
          message:
            error instanceof Error
              ? error.message
              : `Erro ao ${isUpdate ? "atualizar" : "criar"} turma`,
          color: "red",
        });
      }
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit as any);

  return {
    form,
    isUpdate,
    isPending,
    activeStep,
    handleClose,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    session,
  };
}
