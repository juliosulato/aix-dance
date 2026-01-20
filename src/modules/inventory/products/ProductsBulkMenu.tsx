import { MenuItemsProps } from "@/types/menu-items-props.types";
import { ActionIcon, Menu } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";

export const MenuItems = ({
  selectedIds,
  onBulkDeleteClick,
}: MenuItemsProps) => (
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
        Deletar {selectedIds.length} selecionado(s)
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
