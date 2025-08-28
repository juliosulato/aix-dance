"use client"

import { Button, LoadingOverlay, Modal } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/pt-br';
import { useState } from "react";
import AvatarUpload from "./avatarUpload";
import NewStudent__PersonalData from "./personalData";
import NewStudent__Address from "../../../AddressForm";
import NewStudent__Checkboxies from "./checkboxies";
import NewStudent__Guardians from "./guardians";
import dayjs from "dayjs";
import { studentSchema, CreateStudentFormData } from "@/schemas/studentSchema";
import { useDisclosure } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { ZodError } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

dayjs.locale("pt-br");

type Props = {
  opened: boolean;
  onClose: () => void;
};

function NewStudent({ opened, onClose }: Props) {
  const t = useTranslations("");
  const session = useSession();
  const [visible, { toggle }] = useDisclosure(false);
  const [avatar, setAvatar] = useState<File | null>(null);

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<CreateStudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      guardian: [], // importante para iniciar o array vazio
    },
  });

  const guardians = watch("guardian");

  async function createStudent(data: CreateStudentFormData) {
    toggle();
    notifications.show({ message: "Estamos processando a criação do estudante..." });

    const body = { ...data };

    try {
      await fetch(`${process.env.BACKEND_URL}/api/v1/tenancies/${session?.data?.user.tenancyId}/students`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then((resp) => resp.json());
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach(issue => {
          notifications.show({
            color: "red",
            message: t(`zod.${issue.code}`, { path: issue.path.join(".") })
          });
        });
      }
    } finally {
      toggle();
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("students-modals.titles.create")}
      size="auto"
      radius="lg"
      centered
      classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}
    >
      <form onSubmit={handleSubmit(createStudent)} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
        <AvatarUpload setFile={setAvatar} />
        <NewStudent__PersonalData control={control} register={register} errors={errors} />
        <NewStudent__Address register={register} errors={errors} />
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
      <LoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'violet', type: 'dots' }}
      />
    </Modal>
  );
}

export default NewStudent;
