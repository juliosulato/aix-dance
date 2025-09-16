"use client"

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
import { Address as AddressPrisma, Class, Student, StudentContract, StudentGuardian, StudentHistory } from "@prisma/client";
import { CreateStudentInput, getCreateStudentSchema } from "@/schemas/academic/student.schema";

dayjs.extend(customParseFormat);

export interface StudentFromApi extends Student {
  address: AddressPrisma;
  guardian: StudentGuardian[];
  classes: Class[];
  attendanceAverage: number;
  history: StudentHistory[];
  contracts: StudentContract[];
}

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<StudentFromApi>;
};


function NewStudent({ opened, onClose, mutate }: Props) {
  const t = useTranslations("");
  const locale = useLocale();
  dayjs.locale(locale);

  const { data: sessionData, status } = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const createStudentSchema = getCreateStudentSchema((key: string) => t(key as any));

  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      guardian: [],
      healthProblems: "",
      medicalAdvice: "",
      painOrDiscomfort: "",
    },
  });

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
        image: avatarUrl
      };


      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/students`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update plan.");

      notifications.show({
        message: t("update.notifications.success"),
        color: "green"
      });
      setAvatarUrl(null);
      reset();
      mutate();
      onClose();
    } catch (error) {
      console.error(error);
      notifications.show({
        title: t("general.errors.title"),
        message: t("general.errors.unexpected"),
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
    if (status !== "authenticated") return <div>{t("general.errors.invalidSession")}</div>;

    return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={t("academi.students.modals.titles.create")}
        size="auto"
        radius="lg"
        centered
        classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
        className="!relative"
      >
        <form onSubmit={handleSubmit(createStudent, onError)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
          <AvatarUpload onUploadComplete={setAvatarUrl} />
          <PersonalData control={control as any} register={register as any} errors={errors} />
          <Address register={register} errors={errors} />
          <Checkboxies   control={control as any} errors={errors} />
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
