import { ActionIcon, Menu } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";

interface Props {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function BillBulkMenu({
  selectedIds,
  onBulkDeleteClick,
}: Props) {
  return (
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
}
