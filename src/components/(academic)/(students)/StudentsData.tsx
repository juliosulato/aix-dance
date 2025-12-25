"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deletePlans from "./delete";
import {
  ActionIcon,
  Avatar,
  Badge,
  LoadingOverlay,
  Menu,
  Text,
  Tooltip,
} from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/es";
import "dayjs/locale/en";
import NewStudent from "./modals/NewStudent";
import UpdateStudent from "./modals/UpdateStudent";
import { StudentFromApi } from "./StudentFromApi";
import Class from "@/types/Class";
import Image from "next/image";



interface MenuItemProps {
  student: StudentFromApi;
  onUpdateClick: (b: StudentFromApi) => void;
  onDeleteClick: (b: StudentFromApi) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function StudentsData() {
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFromApi | null>(
    null
  );
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  type Item = StudentFromApi & { fullName: string };
  type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
  type PaginatedResponseLocal<T> = { items: T[]; pagination: PaginationInfo };

  const {
    data: students,
    error,
    isLoading,
    mutate,
  } = useSWR<Item[] | PaginatedResponseLocal<Item>>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/students?page=${page}&limit=${limit}`
        : null,
    async (url: string) => {
      const res = await fetcher<any>(url);
      const rawItems: StudentFromApi[] = Array.isArray(res)
        ? res
        : res.items ?? res.students ?? res.products ?? [];
      const items: Item[] = rawItems.map((s) => ({ ...s, fullName: `${s.firstName} ${s.lastName}` }));

      if (Array.isArray(res)) {
        return {
          items,
          pagination: {
            page: 1,
            limit: items.length || limit,
            total: items.length,
            totalPages: 1,
          },
        } as PaginatedResponseLocal<Item>;
      }

      const pagination = res.pagination ?? { page, limit, total: items.length, totalPages: 1 };
      return { items, pagination } as PaginatedResponseLocal<Item>;
    }
  );

  const handleUpdateClick = (student: StudentFromApi) => {
    setSelectedStudent(student);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (student: StudentFromApi) => {
    setSelectedStudent(student);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleBulkDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setSelectedStudent(null);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedStudent
        ? [selectedStudent.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await deletePlans(finalIdsToDelete, tenancyId, mutate as any);
      mutate();
    } catch (error) {
      console.error("Falha ao excluir alunos:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedStudent(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({
    student,
    onUpdateClick,
    onDeleteClick,
  }: MenuItemProps) => (
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
            onClick={() => onUpdateClick(student)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(student)}
          >
            {"Excluir"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );

  const MenuItems = ({ selectedIds, onBulkDeleteClick }: MenuItemsProps) => (
    <Menu shadow="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="light" color="gray" radius={"md"}>
          <BiDotsVerticalRounded />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{"Ações"}</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onBulkDeleteClick(selectedIds)}
        >
          {`Excluir ${selectedIds.length} item${
            selectedIds.length > 1 ? "s" : ""
          }`}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;
  if (error) return <p>{"Erro inesperado"}</p>;

  return (
    <>
      <DataView<StudentFromApi & { fullName: string }>
        data={
          students ?? {
            items: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          }
        }
        itemKey="items"
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Novo Aluno",
        }}
        baseUrl="/system/academic/students/"
        mutate={mutate}
        onPageChange={(nextPage, nextLimit) => {
          setPage(nextPage);
          setLimit(nextLimit);
        }}
        pageTitle={"Alunos e Matrículas"}
        searchbarPlaceholder={"Procure por nome, CPF ou e-mail do aluno..."}
        columns={[
          {
            key: "fullName",
            label: "Nome",
            sortable: true,
            render: (value, item) => (
              <div className="flex gap-1 flex-row text-nowrap items-center">
                <Avatar
                  name={item.image ? "" : item.firstName}
                  color="#7439FA"
                  size="48px"
                  radius={"10px"}
                />
                <span className="ml-2">{value}</span>
              </div>
            ),
          },
          {
            key: "classes",
            label: "Turmas",
            sortable: true,
            render: (value) => {
              if (value && Array.isArray(value)) {
                value.map((c: Class) => c.name).join(", ");
              } else {
                return value;
              }
            },
          },
          {
            key: "subscriptions",
            label: "Plano",
            sortable: true,
            render: (val: StudentFromApi["subscriptions"]) => {
              if (Array.isArray(val) && val.length > 0) {
                return (
                  val.slice(0, 2).map((sub) => sub?.plan?.name).join(", ") +
                  (val.length > 2 ? ", ..." : "")
                );
              }

              return "-";
            }
          },
          {
            key: "documentOfIdentity",
            label: "Documento",
            sortable: true,
          },
          {
            key: "canLeaveAlone",
            label: "Pode sair sozinho?",
            sortable: true,
            render: (val) => (val ? "Sim" : "Não"),
          },
          {
            key: "attendanceAverage",
            label: "Frequência",
            render: (value: number) => {
              if (value === 0) return "-";
              if (value < 50) return <span className="text-red-500">{value}%</span>;
              if (value < 70) return <span className="text-yellow-500">{value}%</span>;
              if (value < 90) return <span className="text-blue-500">{value}%</span>;
              return <span className="text-green-500">{value}%</span>;
            },
          },
          {
            key: "cellPhoneNumber",
            label: "Telefone",
            sortable: true,
            render: (value) => (
              <a href={`https://wa.me/${value.replace(/\D/g, "")}`}>{value}</a>
            ),
          },
          {
            key: "active",
            label: "Status",
            sortable: true,
            render: (active) => {
              if (active) {
                return (
                  <Badge color="green" variant="filled">Ativo</Badge>
                );
              } else {
                return (
                  <Badge color="red" variant="filled">Inativo</Badge>
                );
              }
            },
          },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            student={item}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkDeleteClick={handleBulkDeleteClick}
          />
        )}
        renderCard={(item) => (
          <div className="flex flex-col gap-3">
            {/* --- Cabeçalho com Imagem, Nome e Menu --- */}
            <div className="flex flex-row justify-between items-start">
              <div className="flex items-center gap-4">
                {item.image ? (
                  <Image
                    src={item.image || "/default-avatar.png"}
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
                    Matrícula: {dayjs(item.createdAt).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </div>
              <MenuItem
                student={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>

            {/* --- Corpo com Informações Adicionais --- */}
            <div className="mt-2 pl-2 border-l-2 border-gray-200">
              {/* Seção de Turmas */}
              <div className="flex items-center gap-2 mb-2">
                <Text size="sm" fw={500} className="w-24">
                  Turmas:
                </Text>
                <Text size="sm" c="dimmed">
                  {item.classes &&
                  Array.isArray(item.classes) &&
                  item.classes.length > 0
                    ? item.classes.map((c: Class) => c.name).join(", ")
                    : "Nenhuma turma"}
                </Text>
              </div>

              <div className="flex items-center gap-2">
                <Text size="sm" fw={500} className="w-24">
                  Frequência:
                </Text>

                {/* Reutilizando sua lógica de cores para a frequência */}
                {(item.attendanceAverage ?? 0) === 0 ? (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                ) : (item.attendanceAverage ?? 0) < 50 ? (
                  <Text size="sm" fw={700} className="text-red-500">
                    {item.attendanceAverage}%
                  </Text>
                ) : (item.attendanceAverage ?? 0) < 75 ? (
                  <Text size="sm" fw={700} className="text-yellow-500">
                    {item.attendanceAverage}%
                  </Text>
                ) : (
                  <Text size="sm" fw={700} className="text-green-500">
                    {item.attendanceAverage}%
                  </Text>
                )}
              </div>

              {/* Seção de Contato */}
              <div className="flex items-center gap-2 mt-2">
                <Text size="sm" fw={500} className="w-24">
                  WhatsApp:
                </Text>
                <a
                  href={`https://wa.me/${item.cellPhoneNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {item.cellPhoneNumber}
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Text size="sm" fw={500} className="w-24">
                  Status:
                </Text>
                {item.active}
                {(() => {
                  if (item.active) {
                    return (
                      <Tooltip label={"Ativo"} color="green">
                        <div
                          className={`w-4 h-4 rounded-full bg-green-500`}
                        ></div>
                      </Tooltip>
                    );
                  } else {
                    return (
                      <Tooltip label={"Inativo"} color="red">
                        <div
                          className={`w-4 h-4 rounded-full bg-red-500`}
                        ></div>
                      </Tooltip>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      />

      <NewStudent
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selectedStudent && (
        <UpdateStudent
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          mutate={mutate as any}
        />
      )}

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Confirmação de Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? `Tem certeza de que deseja excluir ${idsToDelete.length} aluno${
              idsToDelete.length > 1 ? "s" : ""
            }?`
          : `Tem certeza de que deseja excluir o aluno ${
              selectedStudent?.firstName + " " + selectedStudent?.lastName || ""
            }?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Esta ação não pode ser desfeita."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
