"use client";

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import AvatarUpload from "@/components/avatarUpload";
import PersonalData from "./personalData";
import Checkboxies from "./checkboxies";
import Guardians from "./guardians";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import customParseFormat from "dayjs/plugin/customParseFormat";
import Address from "../../../AddressForm";
import { KeyedMutator } from "swr";
import { UpdateStudentInput, updateStudentSchema } from "@/schemas/academic/student.schema";
import { StudentFromApi } from "../StudentFromApi";

dayjs.extend(customParseFormat);



type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<StudentFromApi>;
  student: StudentFromApi | null;
};


function UpdateStudent({ opened, onClose, mutate, student }: Props) {

  const { data: sessionData, status } = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);


  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      guardian: [],
      healthProblems: "",
      medicalAdvice: "",
      painOrDiscomfort: "",
    },
    mode: "onBlur"
  });
  const guardians = watch("guardian");

useEffect(() => {
  if (student) {
    reset({
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender as "MALE" | "FEMALE" | "NON_BINARY" | "OTHER",
      cellPhoneNumber: student.cellPhoneNumber,
      dateOfBirth: student.dateOfBirth
        ? dayjs(student.dateOfBirth).format("YYYY-MM-DD")
        : "",
      documentOfIdentity: student.documentOfIdentity,
      email: student.email ?? undefined,
      phoneNumber: student.phoneNumber ?? undefined,
      pronoun: student.pronoun ?? undefined,
      healthProblems: student.healthProblems ?? "",
      medicalAdvice: student.medicalAdvice ?? "",
      painOrDiscomfort: student.painOrDiscomfort ?? "",
      guardian: student.guardian?.map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        cellPhoneNumber: g.cellPhoneNumber,
        email: g.email ?? undefined,
        phoneNumber: g.phoneNumber ?? undefined,
        relationship: g.relationShip,
        documentOfIdentity: g.documentOfIdentity ?? undefined,
      })) ?? [],
    });

    setAvatarUrl(student.image || "");
  }
  
}, [student, reset]);


  async function createStudent(data: UpdateStudentInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }


    setVisible(true);
    try {
      const payload = {
        ...data,
        image: avatarUrl
      };


      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/students/${student?.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update plan.");

      notifications.show({
        message: "Aluno atualizado com sucesso",
        color: "green"
      });
      setAvatarUrl(undefined);
      reset();
      mutate();
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Algo deu errado",
        message: "Não foi possível atualizar o aluno.",
        color: "red"
      });
    } finally {
      setVisible(false);
    }
  }

  const onError = (errors: any) => {
    console.log("Erros de validação:", errors);
  };

    if (status === "loading") return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Sessão inválida</div>;

    return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={"Atualizar Aluno"}
        size="auto"
        radius="lg"
        centered
        classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
        className="!relative"
      >
        <form onSubmit={handleSubmit(createStudent, onError)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
          <AvatarUpload  defaultUrl={avatarUrl} onUploadComplete={setAvatarUrl} />
          <PersonalData control={control as any} register={register as any} errors={errors} />
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
            className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
          >
            {"Salvar"}
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

export default UpdateStudent;
