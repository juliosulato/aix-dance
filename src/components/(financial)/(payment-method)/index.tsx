"use client";
import DataView from "@/components/ui/DataView";
import { useState } from "react";
import NewFormsOfReceipt from "./modals/NewFormsOfReceipt";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { useSession } from "@/lib/auth-client";
import {
  PaymentFee,
  FormsOfReceipt as DefaultFormsOfReceipt,
} from "@/types/receipt.types";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import deleteFormsOfReceipt from "./deleteFormsOfReceipt";
import UpdateFormsOfReceipt from "./modals/updateFormsOfReceipt";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export interface FormsOfReceipt extends DefaultFormsOfReceipt {
  fees: PaymentFee[];
}

interface MenuItemProps {
  formsOfReceipt: FormsOfReceipt;
  onUpdateClick: (pm: FormsOfReceipt) => void;
  onDeleteClick: (pm: FormsOfReceipt) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function FormsOfReceiptsView() {
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const [selectedFormsOfReceipt, setSelectedFormsOfReceipt] =
    useState<FormsOfReceipt | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    data: formsOfReceipts,
    error,
    isLoading,
    mutate,
  } = useSWR<FormsOfReceipt[]>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/forms-of-receipt`
        : null,
    fetcher
  );

  const handleUpdateClick = (pm: FormsOfReceipt) => {
    setSelectedFormsOfReceipt(pm);
    setOpenUpdate(true); // ADICIONADO: Abertura explícita do modal.
  };

  const handleDeleteClick = (pm: FormsOfReceipt) => {
    setSelectedFormsOfReceipt(pm);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleBulkDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setSelectedFormsOfReceipt(null);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedFormsOfReceipt
        ? [selectedFormsOfReceipt.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await deleteFormsOfReceipt(finalIdsToDelete, tenancyId);
      mutate();
    } catch (error) {
      console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedFormsOfReceipt(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({
    formsOfReceipt,
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
            onClick={() => onUpdateClick(formsOfReceipt)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(formsOfReceipt)}
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
          {"Excluir selecionados"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>Sessão inválida</div>;
  if (error) return <p>{"Erro inesperado"}</p>;

  return (
    <>
      <DataView<FormsOfReceipt>
        data={formsOfReceipts || []}
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Nova Forma de Recebimento",
        }}
        baseUrl="/system/financial/forms-of-receipt/"
        mutate={mutate as any}
        pageTitle={"Formas de Recebimento"}
        searchbarPlaceholder={"Pesquisar meios de recebimento..."}
        columns={[
          { key: "name", label: "Nome" },
          { key: "operator", label: "Operador" },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            formsOfReceipt={item}
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
                formsOfReceipt={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
            <div className="flex flex-col mt-4">
              {item.operator && (
                <Text size="sm" c="dimmed">
                  {"Operador:"} {item.operator}
                </Text>
              )}
              <Text size="xs" c="dimmed" mt="sm">
                {"Criado em:"} {dayjs(item.createdAt).format("DD/MM/YYYY")}
              </Text>
            </div>
          </>
        )}
      />

      <NewFormsOfReceipt
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selectedFormsOfReceipt && (
        <UpdateFormsOfReceipt
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedFormsOfReceipt(null);
          }}
          formsOfReceipt={selectedFormsOfReceipt}
          mutate={mutate as any}
        />
      )}

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Excluir Forma de Recebimento"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? "Tem certeza que deseja excluir os métodos de pagamento selecionados?"
          : `Tem certeza que deseja excluir o método de pagamento selecionado?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Atenção: esta ação é irreversível."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
