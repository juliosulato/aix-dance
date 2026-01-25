import { Badge } from "@mantine/core";
import { Class } from "@/types/class.types";
import { Column } from "@/types/data-view.types";

export const classesTableColumns: Column<Class>[] = [
  {
    key: "name" as keyof Class,
    label: "Nome da Turma",
    sortable: true,
    render: (item: Class) => item.name,
  },
  {
    key: "modalityId" as keyof Class,
    label: "Modalidade",
    sortable: true,
    render: (item: Class) => item.modality?.name || "-",
  },
  {
    key: "online" as keyof Class,
    label: "Formato",
    sortable: true,
    render: (item: Class) => (
      <Badge color={item.online ? "blue" : "green"} variant="light">
        {item.online ? "Online" : "Presencial"}
      </Badge>
    ),
  },
  {
    key: "active" as keyof Class,
    label: "Status",
    sortable: true,
    render: (item: Class) => (
      <Badge color={item.active ? "green" : "gray"} variant="light">
        {item.active ? "Ativa" : "Inativa"}
      </Badge>
    ),
  },
];
