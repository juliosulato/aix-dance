import { Card, Group, Text, ActionIcon, Menu } from "@mantine/core";
import { Modality } from "@/types/class.types";
import { FiMoreVertical } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";

type ModalityCardProps = {
  item: Modality;
  handleUpdate: (item: Modality) => void;
  handleDelete: (item: Modality) => void;
};

export default function ModalityCard({
  item,
  handleUpdate,
  handleDelete,
}: ModalityCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="lg">
          {item.name}
        </Text>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <FiMoreVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<MdEdit size={16} />}
              onClick={() => handleUpdate(item)}
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<MdDelete size={16} />}
              color="red"
              onClick={() => handleDelete(item)}
            >
              Excluir
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}
