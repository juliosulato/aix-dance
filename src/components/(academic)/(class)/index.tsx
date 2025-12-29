"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR from "swr";
import archiveClasses from "./archive"; // ATUALIZADO: Importa a nova função
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiArchiveIn } from "react-icons/bi"; // ATUALIZADO: Ícone de arquivar
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewClass from "./modals/NewClass";
import UpdateClass from "./modals/UpdateClass";
import AssignStudents from "./modals/AssignStudents";
import { FaRegUser } from "react-icons/fa";
import { Class, ClassAttendance, Modality } from "@/types/class.types";
import { Student, StudentClass } from "@/types/student.types";
import { User } from "@/types/user.types";

export interface ClassFromApi extends Class {
  modality: Modality;
  teacher: User;
  assistant: User | null;
  studentClasses: (StudentClass & {
    student: Student;
  })[];
  classAttendances?: ClassAttendance[];
}

interface MenuItemProps {
  classItem: ClassFromApi;
  onUpdateClick: (c: ClassFromApi) => void;
  onArchiveClick: (c: ClassFromApi) => void; // ATUALIZADO: Ação de arquivar
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkArchiveClick: (ids: string[]) => void; // ATUALIZADO: Ação de arquivar em massa
}

export default function AllClassesData() {
  const { data: sessionData } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isOpenAssignStudents, setIsOpenAssignStudents] =
    useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassFromApi | null>(null);
  const [idsToArchive, setIdsToArchive] = useState<string[]>([]); // ATUALIZADO: Nomenclatura
  const [isArchiving, setIsArchiving] = useState<boolean>(false); // ATUALIZADO: Nomenclatura

  type Item = ClassFromApi;
  type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
  type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

  const {
    data: classes,
    error,
    isLoading,
    mutate,
  } = useSWR<Item[] | PaginatedResponseLocal<Item>>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/classes`
        : null,
    async (url: string) => {
      const res = await fetcher<any>(url);
      const itemsRaw: ClassFromApi[] = Array.isArray(res) ? res : res.classes ?? [];
      const items: Item[] = itemsRaw;
      if (Array.isArray(res)) return items;
      const pagination = res.pagination ?? { page: 1, limit: items.length || 10, total: items.length, totalPages: 1 };
      return { products: items, pagination } as PaginatedResponseLocal<Item>;
    }
  );

  const handleUpdateClick = (classItem: ClassFromApi) => {
    setSelectedClass(classItem);
    setOpenUpdate(true);
  };

  // ATUALIZADO: Lógica para o clique em "Arquivar"
  const handleArchiveClick = (classItem: ClassFromApi) => {
    setSelectedClass(classItem);
    setIdsToArchive([]);
    setConfirmModalOpen(true);
  };

  // ATUALIZADO: Lógica para o clique em "Arquivar em Massa"
  const handleBulkArchiveClick = (ids: string[]) => {
    setIdsToArchive(ids);
    setSelectedClass(null);
    setConfirmModalOpen(true);
  };

  // ATUALIZADO: Confirmação e chamada da função de arquivamento
  const handleArchiveConfirm = async () => {
    setIsArchiving(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToArchive =
      idsToArchive.length > 0
        ? idsToArchive
        : selectedClass
        ? [selectedClass.id]
        : [];

    if (finalIdsToArchive.length === 0) {
      setIsArchiving(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await archiveClasses(finalIdsToArchive, tenancyId, mutate as any);
      // O mutate já é chamado dentro da função de arquivamento
    } catch (error) {
      console.error("Falha ao arquivar a(s) turma(s):", error);
    } finally {
      setIsArchiving(false);
      setConfirmModalOpen(false);
      setSelectedClass(null);
      setIdsToArchive([]);
    }
  };

  // ATUALIZADO: Componente do Menu com a ação de "Arquivar"
  const MenuItem = ({
    classItem,
    onUpdateClick,
    onArchiveClick,
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
            onClick={() => onUpdateClick(classItem)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            leftSection={<FaRegUser size={14} />}
            onClick={() => setIsOpenAssignStudents(true)}
          >
            {"Atribuir Alunos"}
          </Menu.Item>
          <Menu.Item
            color="orange"
            leftSection={<BiArchiveIn size={14} />}
            onClick={() => onArchiveClick(classItem)}
          >
            Arquivar
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );

  // ATUALIZADO: Menu de ações em massa
  const MenuItems = ({ selectedIds, onBulkArchiveClick }: MenuItemsProps) => (
    <Menu shadow="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="light" color="gray" radius={"md"}>
          <BiDotsVerticalRounded />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Arquivar</Menu.Label>
        <Menu.Item
          color="orange"
          leftSection={<BiArchiveIn size={14} />}
          onClick={() => onBulkArchiveClick(selectedIds)}
        >
          Arquivar Todos
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>{"Não autenticado"}</div>;
  if (error) return <p>{"Erro"}</p>;

  return (
    <>
      <DataView<ClassFromApi>
        data={classes ?? []}
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Nova Turma",
        }}
        baseUrl="/system/academic/classes/"
  mutate={mutate}
        pageTitle={"Turmas"}
        searchbarPlaceholder={
          "Busque por nome da turma, professor, modalidade..."
        }
        columns={[
          { key: "name", label: "Nome", sortable: true },
          {
            key: "modality",
            label: "Modalidade",
            render: (modality) => modality?.name || "-",
            sortable: true,
          },
          {
            key: "teacher",
            label: "Professor",
            sortable: true,
            render: (teacher) =>
              teacher ? `${teacher.firstName} ${teacher.lastName}` : "-",
          },
          {
            key: "studentClasses",
            label: "Alunos",
            sortable: true,
            render: (studentClasses: ClassFromApi["studentClasses"]) =>
              studentClasses.length,
          },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            classItem={item}
            onUpdateClick={handleUpdateClick}
            onArchiveClick={handleArchiveClick}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkArchiveClick={handleBulkArchiveClick}
          />
        )}
        renderCard={(item) => (
          <>
            <div className="flex flex-row justify-between items-start">
              <Text fw={500} size="lg">
                {item.name}
              </Text>
              <MenuItem
                classItem={item}
                onUpdateClick={handleUpdateClick}
                onArchiveClick={handleArchiveClick}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Text size="sm">
                <strong>{"Modalidade"}:</strong> {item.modality?.name || "-"}
              </Text>
              <Text size="sm">
                <strong>{"Professor"}:</strong>{" "}
                {item.teacher
                  ? `${item.teacher.firstName} ${item.teacher.lastName}`
                  : "-"}
              </Text>
              <Text size="sm">
                <strong>{"Alunos"}:</strong> {item.studentClasses.length ?? 0}
              </Text>
            </div>
          </>
        )}
      />

      <NewClass
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selectedClass && (
        <UpdateClass
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedClass(null);
          }}
          classData={selectedClass as any}
          mutate={mutate as any}
        />
      )}

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        title={"Confirmar Arquivamento"}
        confirmLabel={"Arquivar"}
        cancelLabel={"Cancelar"}
        loading={isArchiving}
      >
        {idsToArchive.length > 0 ? (
          "Tem certeza que deseja arquivar todos essas turmas?"
        ) : (
          <span>
            Tem certeza que deseja arquivar a turma{" "}
            <strong>{selectedClass?.name}</strong>?
          </span>
        )}
        <br />
        <Text component="span" c="orange" size="sm" fw={500} mt="md">
          T
        </Text>
      </ConfirmationModal>
      {selectedClass && (
        <AssignStudents
          opened={isOpenAssignStudents}
          onClose={() => setIsOpenAssignStudents(false)}
          classData={selectedClass as any}
          mutate={mutate as any}
        />
      )}
    </>
  );
}
