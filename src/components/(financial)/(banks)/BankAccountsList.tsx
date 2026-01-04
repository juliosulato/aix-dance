"use client";

import { deleteBanks } from "@/actions/financial/banks/delete";
import { ActionIcon, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import BankFormModal from "./BankFormModal";
import { Bank } from "@/types/bank.types";
import { useCrud } from "@/hooks/useCrud";

interface BankAccountsListProps {
  banks: Bank[];
}

interface MenuItemProps {
  bank: Bank;
  onUpdateClick: (b: Bank) => void;
  onDeleteClick: (b: Bank) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

const MenuItem = ({ bank, onUpdateClick, onDeleteClick }: MenuItemProps) => (
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
          onClick={() => onUpdateClick(bank)}
        >
          {"Editar"}
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onDeleteClick(bank)}
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
        Deletar {selectedIds.length} selecionados
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default function BankAccountsList({ banks }: BankAccountsListProps) {
  const crud = useCrud<Bank>({
    deleteAction: deleteBanks,
  });

  return (
    <>
      <DataView<Bank>
        data={banks}
        itemKey="banks"
        openNewModal={{
          func: crud.handleCreate,
          label: "Novo Banco",
        }}
        baseUrl="/system/financial/banks/"
        pageTitle={"Bancos"}
        searchbarPlaceholder={"Procurar bancos..."}
        columns={[{ key: "name", label: "Nome"}, { key: "code", label: "Código" }, { key: "agency", label: "Agência" }, { key: "account", label: "Conta" }]}
        RenderRowMenu={(item) => (
          <MenuItem
            bank={item}
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
                bank={item}
                onUpdateClick={crud.handleUpdate}
                onDeleteClick={crud.handleDelete}
              />
            </div>
            {(item.agency ||
              item.code || item.account) && (
                <div className="grid grid-cols-2 gap-2 text-sm text-neutral-500">
                  {item.agency && <p>Agência: {item.agency}</p>}
                  {item.code && <p>Código: {item.code}</p>}
                  {item.account && <p>Conta: {item.account}</p>}
                </div>
              )}
          </>
        )}
      />

      <BankFormModal
        opened={crud.modals.create}
        onClose={crud.closeModals.create}
        key={"new-" + crud.formVersion}
      />

      {crud.selectedItem && (
        <BankFormModal
          opened={crud.modals.update}
          onClose={crud.closeModals.update}
          bankToEdit={crud.selectedItem}
          key={"update-" + crud.formVersion}
        />
      )}

      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={crud.closeModals.delete}
        onConfirm={crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {crud.idsToDelete.length > 0
          ? `Tem certeza que deseja excluir ${crud.idsToDelete.length} banco${
              crud.idsToDelete.length > 1 ? "s" : ""
            }?`
          : `Tem certeza que deseja excluir o banco "${
              crud.selectedItem?.name || ""
            }"?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação é irreversível."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
