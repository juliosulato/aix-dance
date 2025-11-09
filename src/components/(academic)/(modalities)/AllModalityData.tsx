"use client";

import { fetcher } from "@/utils/fetcher";
import { Modality } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteModality from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewModalities from "./NewModalities";
import UpdateModalities from "./UpdateModalities";

interface MenuItemProps {
  categoryGroup: Modality;
  onUpdateClick: (b: Modality) => void;
  onDeleteClick: (b: Modality) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

 

export default function AllModalityData() {
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedModality, setSelectedModality] = useState<Modality | null>(
    null
  );
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const {
    data: modalities,
    error,
    isLoading,
    mutate,
  } = useSWR<Modality[] | { products: Modality[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    () =>
      sessionData?.user?.tenancyId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${
            sessionData.user.tenancyId
          }/modalities?page=${page}&limit=${limit}${
            sortKey ? `&sortKey=${encodeURIComponent(sortKey)}` : ""
          }${sortDir ? `&sortDir=${encodeURIComponent(sortDir)}` : ""}`
        : null,
    async (url: string) => {
      const res = await fetcher<any>(url);
      if (Array.isArray(res)) return res as Modality[];
      const items = res.modalities ?? [];
      const pagination = res.pagination ?? { page, limit, total: items.length, totalPages: 1 };
      return { products: items, pagination };
    }
  );

  const handleUpdateClick = (modality: Modality) => {
    setSelectedModality(modality);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (modality: Modality) => {
    setSelectedModality(modality);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleBulkDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setSelectedModality(null);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedModality
        ? [selectedModality.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await deleteModality(finalIdsToDelete, tenancyId, mutate as any);
      mutate();
    } catch (error) {
      console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedModality(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({
    categoryGroup,
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
            onClick={() => onUpdateClick(categoryGroup)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(categoryGroup)}
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
        <Menu.Label>{"Ações em Massa"}</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onBulkDeleteClick(selectedIds)}
        >
          Excluir {selectedIds.length} Modalidades
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;
  if (error) return <p>{"Erro inesperado"}</p>;

  return (
    <>
      <DataView<Modality>
        disableTable
        data={modalities ?? { products: [], pagination: { page, limit, total: 0, totalPages: 0 } }}
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Nova Modalidade",
        }}
        baseUrl="/system/financial/modalities/"
  mutate={mutate}
        onPageChange={(p, l, sort) => {
          setPage(p);
          setLimit(l);
          if (sort) {
            setSortKey(String(sort.key as string));
            setSortDir(sort.direction);
          }
        }}
        pageTitle={"Modalidades"}
        searchbarPlaceholder={"Pesquisar modalidades..."}
        columns={[{ key: "name", label: "Nome" }]}
        RenderRowMenu={(item) => (
          <MenuItem
            categoryGroup={item}
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
          <>
            <div className="flex flex-row justify-between items-start">
              <Text fw={500} size="lg">
                {item.name}
              </Text>
              <MenuItem
                categoryGroup={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </>
        )}
      />

      <NewModalities
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selectedModality && (
        <UpdateModalities
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedModality(null);
          }}
          modality={selectedModality}
          mutate={mutate as any}
        />
      )}

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Excluir Modalidade"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? `Tem certeza que deseja excluir as ${idsToDelete.length} modalidades selecionadas?`
          : `Tem certeza que deseja excluir a modalidade "${
              selectedModality?.name || ""
            }"?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Atenção: esta ação é irreversível."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
