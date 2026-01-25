import { ActionIcon, Menu } from "@mantine/core";
import { Modality } from "@/types/class.types";
import { FiMoreVertical } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";

type RowActionMenuProps = {
  modality: Modality;
  onUpdate: (item: Modality) => void;
  onDelete: (item: Modality) => void;
};

export function RowActionMenu({
  modality,
  onUpdate,
  onDelete,
}: RowActionMenuProps) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <FiMoreVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<MdEdit size={16} />}
          onClick={() => onUpdate(modality)}
        >
          Editar
        </Menu.Item>
        <Menu.Item
          leftSection={<MdDelete size={16} />}
          color="red"
          onClick={() => onDelete(modality)}
        >
          Excluir
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
