"use client";
import DataView from "@/components/ui/DataView";
import NewFormsOfReceipt from "./NewFormsOfReceipt";
import { ActionIcon, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import UpdateFormsOfReceipt from "./UpdateFormsOfReceipt";
import { FormsOfReceipt } from "@/types/receipt.types";
import { useCrud } from "@/hooks/useCrud";
import { deleteFormOfReceipt } from "@/actions/financial/formsOfReceipt/delete";

interface MenuItemProps {
  formsOfReceipt: FormsOfReceipt;
  onUpdateClick: (pm: FormsOfReceipt) => void;
  onDeleteClick: (pm: FormsOfReceipt) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

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

type Props = {
  formsOfReceipt: FormsOfReceipt[];
}

export default function FormsOfReceiptList({ formsOfReceipt }: Props) {
  const crud = useCrud<FormsOfReceipt>({ deleteAction: deleteFormOfReceipt })

  return (
    <>
      <DataView<FormsOfReceipt>
        data={formsOfReceipt || []}
        openNewModal={{
          func: () => crud.handleCreate,
          label: "Nova Forma de Recebimento",
        }}
        baseUrl="/system/financial/forms-of-receipt/"
        pageTitle={"Formas de Recebimento"}
        searchbarPlaceholder={"Pesquisar meios de recebimento..."}
        columns={[
          { key: "name", label: "Nome" },
          { key: "operator", label: "Operador" },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            formsOfReceipt={item}
            onUpdateClick={crud.handleUpdate}
            onDeleteClick={crud.handleDelete}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkDeleteClick={crud.handleBulkDelete}
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
                onUpdateClick={crud.handleUpdate}
                onDeleteClick={crud.handleDelete}
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
        opened={crud.modals.create}
        onClose={() => crud.setModals.setCreate(false)}
      />

      {crud.selectedItem && (
        <UpdateFormsOfReceipt
          opened={crud.modals.update}
          onClose={() => crud.setModals.setUpdate(false)}
          selectedItem={crud.selectedItem}
        />
      )}

      <ConfirmationModal
              opened={crud.modals.delete}
              onClose={() => crud.setModals.setDelete(false)}
              onConfirm={() => crud.confirmDelete}
        title={"Excluir Forma de Recebimento"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {crud.idsToDelete.length > 0
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
