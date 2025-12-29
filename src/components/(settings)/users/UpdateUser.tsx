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

import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import AvatarUpload from "@/components/avatarUpload";
import { KeyedMutator } from "swr";
import { UserFromApi } from "./UserFromApi";
import { updateUserSchema, UpdateUserInput } from "@/schemas/user.schema";

import { UserRole } from "@/types/user.types";
import { getErrorMessage } from "@/utils/getErrorMessage";

type Props = {
  opened: boolean;
  onClose: () => void;
  mutate: KeyedMutator<UserFromApi[]>;
  user: UserFromApi;
  tenancyId: string;
};

function UpdateUser({ opened, onClose, mutate, user, tenancyId }: Props) {
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.image || null);

  // Usamos o schema estático

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      role: user?.role as UserRole,
      prevPassword: "",
      password: "",
      confirmPassword: "",
    },
    mode: "all",
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  async function updateUser(data: UpdateUserInput) {
    setVisible(true);

    if (
      data.prevPassword === "" &&
      (data.password !== "" || data.confirmPassword !== "")
    ) {
      notifications.show({
        color: "red",
        message: "Para alterar a senha informe a senha atual.",
      });
      setVisible(false);
      return;
    }

    if (data.password === "" && data.confirmPassword !== "") {
      notifications.show({
        color: "red",
        message: "Preencha a nova senha antes de confirmar.",
      });
      setVisible(false);
      return;
    }

    if (data.password !== "" && data.confirmPassword === "") {
      notifications.show({ color: "red", message: "Confirme a nova senha." });
      setVisible(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      notifications.show({ color: "red", message: "As senhas não coincidem." });
      setVisible(false);
      return;
    }

    try {
      const resp = await fetch(
        `/api/v1/tenancies/${tenancyId}/users/${user.id}`,
        {
          method: "PUT",
                credentials: "include",
          body: JSON.stringify({
            ...data,
            image: avatar,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!resp.ok) {
        const error = await resp.json();
        if (error?.code === "INVALID_PASSWORD") {
          notifications.show({
            color: "red",
            message: "Senha atual inválida.",
          });
        } else {
          throw new Error("Erro ao atualizar usuário");
        }
        return;
      }

      notifications.show({
        message: "Usuário atualizado com sucesso.",
        color: "green",
      });
      handleClose();
      mutate();
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifications.show({
          color: "red",
          message: getErrorMessage(
            error,
            "Falha ao atualizar usuário. Tente novamente."
          ),
        });
      }
    } finally {
      setVisible(false);
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={"Editar Usuário"}
        size="xl"
        radius="lg"
        centered
        classNames={{
          title: "!font-semibold",
          header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300",
        }}
      >
        <form
          onSubmit={handleSubmit(updateUser)}
          className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6"
        >
          <div className="flex flex-col gap-4">
            <AvatarUpload
              defaultUrl={avatar}
              onUploadComplete={setAvatar}
              folder="users/avatars"
            />

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

            {/* Seção de atualização de senha */}
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-3">
              <Controller
                control={control}
                name="prevPassword"
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label={"Senha atual"}
                    error={errors.prevPassword?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label={"Nova senha"}
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
                    label={"Confirme a nova senha"}
                    error={errors.confirmPassword?.message}
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
            className="text-sm! font-medium! tracking-wider w-full mdw-fit! ml-auto"
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

export default UpdateUser;
