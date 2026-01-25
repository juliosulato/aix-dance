import { Modality } from "@/types/class.types";
import { Column } from "@/types/data-view.types";

export const modalitiesTableColumns: Column<Modality>[] = [
  {
    key: "name" as keyof Modality,
    label: "Nome da Modalidade",
    sortable: true,
  }
];
