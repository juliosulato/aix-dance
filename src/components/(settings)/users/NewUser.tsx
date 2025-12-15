"use client";

import {
  Button,
  LoadingOverlay,
  Modal,
  PasswordInput,
  TextInput,
  Select,
} from "@mantine/core";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { CreateUserInput, createUserSchema } from "@/schemas/user.schema";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { authedFetch } from "@/utils/authedFetch";
import AvatarUpload from "@/components/avatarUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyedMutator } from "swr";
import { UserFromApi } from "./UserFromApi";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<UserFromApi[]>;
};

function NewUser({ opened, onClose, mutate }: Props) {
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      teacher: undefined,
      role: "STAFF",
    },
    mode: "all",
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const { data: sessionData, status } = useSession();
  if (status === "loading") return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;

  async function createUser(data: CreateUserInput) {
    if (!sessionData?.user.tenancyId) {
      notifications.show({
        color: "red",
        message: "Sessão inválida. Tente novamente.",
      });
      return;
    }

    setVisible(true);

    try {
      const resp = await authedFetch(
        `/api/v1/tenancies/${sessionData.user.tenancyId}/users`,
        {
          method: "POST",
          body: JSON.stringify({
            ...data,
            image: avatar,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const responseData = await resp.json();
      if (responseData?.code == "USER_EXISTS") {
        notifications.show({
          message: "Já existe um usuário com esse e-mail.",
          color: "yellow",
        });
        throw new Error("Erro ao criar usuário");
        return;
      }

      notifications.show({
        message: "Usuário criado com sucesso.",
        color: "green",
      });
      handleClose();
      mutate();
    } catch (err) {
      console.error(err);

      notifications.show({
        color: "red",
        message: "Falha ao criar usuário. Tente novamente.",
      });
    } finally {
      setVisible(false);
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={"Novo Usuário"}
        size="xl"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form
          onSubmit={handleSubmit(createUser)}
          className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6"
        >
          <div className="flex flex-col gap-4">
            <AvatarUpload onUploadComplete={setAvatar} folder="users/avatars" />

            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput
                label={"Primeiro Nome"}
                placeholder={"Ex: Maria"}
                required
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <TextInput
                label={"Sobrenome"}
                placeholder={"Ex: Silva"}
                required
                {...register("lastName")}
                error={errors.lastName?.message}
              />
              <TextInput
                label={"E-mail"}
                placeholder={"usuario@exemplo.com"}
                required
                className="md:col-span-2"
                {...register("email")}
                error={errors.email?.message}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    required
                    label={"Senha"}
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    required
                    label={"Confirme a senha"}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    {...field}
                    label={"Função"}
                    data={[
                      { value: "ADMIN", label: "Administrador" },
                      { value: "STAFF", label: "Funcionário" },
                    ]}
                    required
                  />
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            color="#7439FA"
            radius="lg"
            size="lg"
            fullWidth={false}
            className="!text-sm !font-medium tracking-wider w-full md!w-fit ml-auto"
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

export default NewUser;
