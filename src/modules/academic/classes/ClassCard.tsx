import { Card, Group, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { Class } from "@/types/class.types";
import { FiMoreVertical } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";

type ClassCardProps = {
  item: Class;
  handleUpdate: (item: Class) => void;
  handleDelete: (item: Class) => void;
};

export default function ClassCard({
  item,
  handleUpdate,
  handleDelete,
}: ClassCardProps) {
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

      <Group gap="xs" mb="sm">
        <Badge color={item.active ? "green" : "gray"} variant="light">
          {item.active ? "Ativa" : "Inativa"}
        </Badge>
        <Badge color={item.online ? "blue" : "green"} variant="light">
          {item.online ? "Online" : "Presencial"}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb={4}>
        <strong>Modalidade:</strong> {item.modality?.name || "Não informada"}
      </Text>

      <Text size="xs" c="dimmed" mt="md">
        Criada em: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
      </Text>
    </Card>
  );
}
