"use client"

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/pt-br';
import { useState } from "react";
import AvatarUpload from "@/components/avatarUpload";
import NewStudent__PersonalData from "./personalData";
import NewStudent__Checkboxies from "./checkboxies";
import NewStudent__Guardians from "./guardians";
import dayjs from "dayjs";
import { studentSchema, CreateStudentFormData } from "@/schemas/studentSchema";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { ZodError } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

dayjs.locale("pt-br");
import customParseFormat from "dayjs/plugin/customParseFormat";
import Address from "../../../AddressForm";

dayjs.extend(customParseFormat);

type Props = {
  opened: boolean;
  onClose: () => void;
};


function NewStudent({ opened, onClose }: Props) {
  const t = useTranslations("");
  
  
  const [avatar, setAvatar] = useState<File | null>(null);
  const [visible, setVisible] = useState(false);
  
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<CreateStudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      guardian: [], // importante para iniciar o array vazio,
      healthProblems: "",
      medicalAdvice: "",
      painOrDiscomfort: "",
    },
  });
  
  const guardians = watch("guardian");
  const { data: sessionData, status } = useSession();
  if (status === "loading") {
    return <LoadingOverlay visible />;
  }

  if (status !== "authenticated") {
    return <div>Você precisa estar logado para criar estudantes.</div>;
  }

  async function createStudent(data: CreateStudentFormData) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    const parsedDate = dayjs(data.dateOfBirth, "DD/MM/YYYY", true); // o `true` ativa parsing estrito
    if (!parsedDate.isValid()) {
      notifications.show({ color: "red", message: "Data de nascimento inválida" });
      setVisible(false);
      return;
    }

    const body = {
      ...data,
      dateOfBirth: parsedDate.toISOString(),
    };


    setVisible(true);
    console.log(body, data)
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/students`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) throw new Error("Erro ao criar estudante");

      notifications.show({ message: "Estudante criado com sucesso!" });
    } catch (err) {
      notifications.show({ color: "red", message: "Erro inesperado ao criar estudante" });
    } finally {
      setVisible(false);
    }
  }
  const onError = (errors: any) => {
    console.log("Erros de validação:", errors);
  };
  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={t("students-modals.titles.create")}
        size="auto"
        radius="lg"
        centered
        classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
        className="!relative"
      >
        <form onSubmit={handleSubmit(createStudent, onError)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
          <AvatarUpload setFile={setAvatar} />
          <NewStudent__PersonalData control={control} register={register} errors={errors} />
          <Address register={register} errors={errors} />
          <NewStudent__Checkboxies control={control} errors={errors} />
          {guardians && guardians.length > 0 && (
            <NewStudent__Guardians control={control} errors={errors} />
          )}
          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
          >
            {t("forms.submit")}
          </Button>
        </form>

      </Modal>
      <LoadingOverlay
        visible={visible}
        zIndex={9999}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'violet', type: 'dots' }}
        pos="fixed"
        h="100vh"
        w="100vw"
      />
    </>
  );
}

export default NewStudent;
