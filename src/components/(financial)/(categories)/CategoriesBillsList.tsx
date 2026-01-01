"use client";

import { ActionIcon, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewCategoryBill from "./NewCategoryBill";
import UpdateCategoryBill from "./UpdateCategoryBill";
import { CategoryBill, CategoryGroup } from "@/types/category.types";
import { useCrud } from "@/hooks/useCrud";

interface MenuItemProps {
  categoryGroup: CategoryBill;
  onUpdateClick: (b: CategoryBill) => void;
  onDeleteClick: (b: CategoryBill) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

type Props = {
  categoryGroups: CategoryGroup[];
  categoryBills: CategoryBill[];
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
        Deletar {selectedIds.length} selecionados
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
 
export default function CategoriesBillsList({ categoryGroups, categoryBills }: Props) {
  const crud = useCrud<CategoryBill>();

  return (
    <>
      <DataView<CategoryBill>
        disableTable
        data={categoryBills}
        openNewModal={{
          func: () => crud.handleCreate(),
          label: "Nova Categoria",
        }}
        baseUrl="/system/financial/categories/"
        pageTitle={"Categorias"}
        searchbarPlaceholder={"Procurar categorias..."}
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

      <NewCategoryBill
        opened={crud.modals.create}
        onClose={() => crud.setModals.setCreate(false)}
        categoryGroups={categoryGroups}
        parentCategories={categoryBills}
      />

      {crud.selectedItem && (
        <UpdateCategoryBill
          opened={crud.modals.create}
          onClose={() => crud.setModals.setUpdate(false)}
          selectedItem={crud.selectedItem}
          categoryGroups={categoryGroups}
          parentCategories={categoryBills}
        />
      )}

      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={() => crud.setModals.setDelete(false)}
        onConfirm={() => crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {crud.idsToDelete.length > 0
          ? `Tem certeza que deseja excluir ${
              crud.idsToDelete.length
            } categoria${crud.idsToDelete.length > 1 ? "s" : ""}?`
          : `Tem certeza que deseja excluir a categoria "${
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
