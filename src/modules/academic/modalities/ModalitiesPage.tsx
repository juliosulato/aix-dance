import { Modality } from "@/types/class.types";
import ModalitiesData from "@/modules/academic/modalities/ModalitiesData";
import { getModalities } from "@/actions/academic/modality.actions";

export default async function ModalitiesPage() {
  const result = await getModalities();
  const modalities = result.success ? result.data : [];

  return <ModalitiesData data={modalities || []} />;
}
