import { ActionIcon, Menu } from "@mantine/core";
import { Class } from "@/types/class.types";
import { FiMoreVertical } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";

type RowActionMenuProps = {
  classItem: Class;
  onUpdate: (item: Class) => void;
  onDelete: (item: Class) => void;
};

export function RowActionMenu({
  classItem,
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
          onClick={() => onUpdate(classItem)}
        >
          Editar
        </Menu.Item>
        <Menu.Item
          leftSection={<MdDelete size={16} />}
          color="red"
          onClick={() => onDelete(classItem)}
        >
          Excluir
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
