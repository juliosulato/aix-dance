/* eslint-disable @next/next/no-img-element */
"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import {
  ActionIcon,
  Avatar,
  LoadingOverlay,
  Menu,
  Text,
} from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import NewTeacher from "./NewUser";
import { UserFromApi } from "./UserFromApi";
import UpdateUser from "./UpdateUser";
import deleteUsers from "./delete";
import { notifications } from "@mantine/notifications";

interface MenuItemProps {
  user: UserFromApi;
  onUpdateClick: (t: UserFromApi) => void;
  onDeleteClick: (t: UserFromApi) => void;
}


export default function AllUsersData() {
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserFromApi | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    data: users,
    error,
    isLoading,
    mutate,
  } = useSWR<UserFromApi[]>(
    () =>
      sessionData?.user?.tenancyId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/users`
        : null,
    fetcher
  );
  const d = users
    ?.filter((user) => !user.teacher)
    ?.map((user) => ({
      ...user,
      fullName: user.firstName + " " + user.lastName,
    }));

  const handleUpdateClick = (user: UserFromApi) => {
    setSelectedUser(user);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (user: UserFromApi) => {
    setSelectedUser(user);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedUser
        ? [selectedUser.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      if (users?.length === 1) {
        return notifications.show({
          message: "Não é possível excluir o último usuário.",
          color: "red",
        });
      }

      await deleteUsers(finalIdsToDelete, tenancyId, mutate as any);
      mutate();
    } catch (error) {
      console.error("Falha ao desativar professores:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedUser(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({ user, onUpdateClick, onDeleteClick }: MenuItemProps) => (
    <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <ActionIcon variant="light" color="gray" radius={"md"}>
            <BiDotsVerticalRounded />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{"Ações"}</Menu.Label>
          <Menu.Item
            leftSection={<GrUpdate size={14} />}
            onClick={() => onUpdateClick(user)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => {
              if (d?.length === 1) {
                notifications.show({
                  message: "Não é possível excluir o último usuário.",
                  color: "red",
                });
                return;
              } else {
                onDeleteClick(user);
              }
            }}
          >
            {"Excluir"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;
  if (error) return <p>{"Erro inesperado"}</p>;

  return (
    <>
      <DataView<UserFromApi & { fullName: string }>
        data={d || []}
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Novo Usuário",
        }}
        baseUrl=""
        mutate={mutate as any}
        pageTitle={"Usuários"}
        searchbarPlaceholder={"Pesquisar usuários por nome, e-mail..."}
        columns={[
          {
            key: "image",
            label: "",
            sortable: false,
            render: (val, item) =>
              val ? (
                <a
                  href={val as string}
                  target="_blank"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <img
                    src={val as string}
                    alt={`Foto de ${item.firstName}`}
                    className="object-cover w-16 h-16 rounded-2xl"
                  />
                </a>
              ) : (
                <Avatar
                  name={item.firstName}
                  color="#7439FA"
                  size="64px"
                  radius={"16px"}
                />
              ),
          },
          { key: "fullName", label: "Nome Completo", sortable: true },
          {
            key: "email",
            label: "E-mail",
            sortable: true,
          },
          {
            key: "role",
            label: "Função",
            sortable: true,
            render: (val) => {
              if (val === "ADMIN") {
                return "Administrador";
              } else if (val === "STAFF") {
                return "Funcionário";
              } else {
                return val;
              }
            },
          },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            user={item}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
        renderCard={(item) => (
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between items-start">
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={`Foto de ${item.firstName}`}
                    className="object-cover w-16 h-16 rounded-2xl"
                  />
                ) : (
                  <Avatar
                    name={item.firstName}
                    color="#7439FA"
                    size="64px"
                    radius={"16px"}
                  />
                )}
                <div>
                  <Text fw={700} size="lg" className="leading-tight">
                    {`${item.firstName} ${item.lastName}`}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {`Registrado em ${dayjs(item.createdAt).format(
                      "DD/MM/YYYY"
                    )}`}
                  </Text>
                </div>
              </div>
              <MenuItem
                user={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </div>
        )}
      />

      <NewTeacher
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />
      {selectedUser && (
        <UpdateUser
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          tenancyId={sessionData.user.tenancyId}
          mutate={mutate as any}
        />
      )}
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Confirmação"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? "Tem certeza que deseja excluir os usuários selecionados?"
          : `Tem certeza que deseja excluir o usuário selecionado?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação não pode ser desfeita."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
