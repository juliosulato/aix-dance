import { ActionIcon, Menu } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDelete: (ids: string[]) => void;
}

export const BulkActionMenu = ({ selectedIds, onBulkDelete }: MenuItemsProps) => (
  <Menu shadow="md" width={200} withinPortal>
    <Menu.Target>
      <ActionIcon variant="light" color="gray" radius={"md"}>
        <BiDotsVerticalRounded />
      </ActionIcon>
    </Menu.Target>
    <Menu.Dropdown>
      <Menu.Label>Ações em Massa</Menu.Label>
      <Menu.Item
        color="red"
        leftSection={<BiTrash size={14} />}
        onClick={() => onBulkDelete(selectedIds)}
      >
        {`Excluir ${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""}`}
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);