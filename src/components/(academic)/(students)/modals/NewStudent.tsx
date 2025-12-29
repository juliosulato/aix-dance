"use client";

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import AvatarUpload from "@/components/avatarUpload";
import PersonalData from "./personalData";
import Checkboxies from "./checkboxies";
import Guardians from "./guardians";
import { useSession } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import customParseFormat from "dayjs/plugin/customParseFormat";
import Address from "../../../AddressForm";
import { KeyedMutator } from "swr";
import {
  CreateStudentInput,
  createStudentSchema,
} from "@/schemas/academic/student.schema";
import { StudentFromApi } from "../StudentFromApi";

dayjs.extend(customParseFormat);

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<StudentFromApi>;
};

function NewStudent({ opened, onClose, mutate }: Props) {
  const { data: sessionData, isPending } = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      guardian: [],
      healthProblems: "",
      medicalAdvice: "",
      painOrDiscomfort: "",
    },
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const guardians = watch("guardian");

  async function createStudent(data: CreateStudentInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    setVisible(true);
    try {
      const payload = {
        ...data,
        image: avatarUrl,
      };

      const response = await fetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/students`,
        {
          method: "POST",
                credentials: "include",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to update plan.");

      notifications.show({
        message: "Aluno criado com sucesso",
        color: "green",
      });
      setAvatarUrl(null);
      reset();
      mutate();
      handleClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Algo deu errado",
        message: "Não foi possível criar o aluno.",
        color: "red",
      });
    } finally {
      setVisible(false);
    }
  }

  const onError = (errors: any) => {
    console.log("Erros de validação:", errors);
  };

  if (isPending) return <LoadingOverlay visible />;
  

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={"Novo Aluno"}
        size="auto"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
        }}
        className="!relative"
      >
        <form
          onSubmit={handleSubmit(createStudent, onError)}
          className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6"
        >
          <AvatarUpload onUploadComplete={setAvatarUrl} folder="students/avatars" />
          <PersonalData
            control={control as any}
            register={register as any}
            errors={errors}
          />
          <Address register={register} errors={errors} />
          <Checkboxies control={control as any} errors={errors} />
          {guardians && guardians.length > 0 && (
            <Guardians control={control as any} errors={errors} />
          )}
          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
          >
            {"Salvar"}
          </Button>
        </form>
      </Modal>
      <LoadingOverlay
        visible={visible}
        zIndex={9999}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "violet", type: "dots" }}
        pos="fixed"
        h="100vh"
        w="100vw"
      />
    </>
  );
}

export default NewStudent;
