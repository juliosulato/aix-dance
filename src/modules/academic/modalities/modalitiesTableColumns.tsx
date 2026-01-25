import { Badge } from "@mantine/core";
import { Modality } from "@/types/class.types";
import { Column } from "@/types/data-view.types";

export const modalitiesTableColumns: Column<Modality>[] = [
  {
    key: "name" as keyof Modality,
    label: "Nome da Modalidade",
    sortable: true,
    render: (item: Modality) => item.name,
  },
  {
    key: "createdAt" as keyof Modality,
    label: "Data de Criação",
    sortable: true,
    render: (item: Modality) => 
      new Date(item.createdAt || "").toLocaleDateString("pt-BR"),
  },
];
