"use client";

import { ActionIcon, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import { CategoryGroup } from "@/types/category.types";
import { useCrud } from "@/hooks/useCrud";
import { deleteCategoryGroups } from "@/actions/financial/categoryGroups/delete";
import CategoryGroupFormModal from "./CategoryGroupFormModal";

type Props = {
  categoryGroups: CategoryGroup[];
};

interface MenuItemProps {
  categoryGroup: CategoryGroup;
  onUpdateClick: (b: CategoryGroup) => void;
  onDeleteClick: (b: CategoryGroup) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

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
        {"Excluir selecionados"}
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default function CategoryGroupsList({ categoryGroups }: Props) {
  const crud = useCrud<CategoryGroup>({ deleteAction: deleteCategoryGroups });

  return (
    <>
      <DataView<CategoryGroup>
        disableTable
        data={categoryGroups || []}
        openNewModal={{
          func: crud.handleCreate,
          label: "Novo Grupo",
        }}
        baseUrl="/system/financial/category-groups/"
        pageTitle={"Grupos de Categorias"}
        searchbarPlaceholder={"Pesquisar grupos..."}
        columns={[{ key: "name", label: "Nome" }]}
        RenderRowMenu={(item) => (
          <MenuItem
            categoryGroup={item}
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
                categoryGroup={item}
                onUpdateClick={crud.handleUpdate}
                onDeleteClick={crud.handleDelete}
              />
            </div>
          </>
        )}
      />

      <CategoryGroupFormModal
        opened={crud.modals.create}
        onClose={crud.closeModals.create}
        key={"new-" + crud.formVersion}
      />

      {crud.selectedItem && (
        <CategoryGroupFormModal
          opened={crud.modals.update}
          onClose={crud.closeModals.update}
          selectedItem={crud.selectedItem}
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
          ? `Tem certeza que deseja excluir os ${crud.idsToDelete.length} grupos de categorias selecionados?`
          : `Tem certeza que deseja excluir o grupo de categorias ${
              crud.selectedItem?.name || ""
            }?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Aviso: essa operação é irreversível.
        </Text>
      </ConfirmationModal>
    </>
  );
}
