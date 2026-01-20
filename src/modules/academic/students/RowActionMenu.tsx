import { StudentComplete } from "@/types/student.types";
import { ActionIcon, Menu } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";

interface MenuItemProps {
  student: StudentComplete;
  onUpdate: (item: StudentComplete) => void;
  onDelete: (item: StudentComplete) => void;
}

export const RowActionMenu = ({ student, onUpdate, onDelete }: MenuItemProps) => (
  <div onClick={(e) => e.stopPropagation()}>
    <Menu shadow="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="light" color="gray" radius={"md"}>
          <BiDotsVerticalRounded />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Ações</Menu.Label>
        <Menu.Item
          leftSection={<GrUpdate size={14} />}
          onClick={() => onUpdate(student)}
        >
          Editar
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onDelete(student)}
        >
          Excluir
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  </div>
);
