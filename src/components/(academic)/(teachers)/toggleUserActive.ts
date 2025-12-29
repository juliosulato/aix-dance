import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";

import { TeacherFromApi } from "./modals/UpdateTeacher";

async function toggleUserActive(
  item: TeacherFromApi,
  tenancyId: string,
  mutate?: KeyedMutator<TeacherFromApi[]>
) {
  if (!item) {
    notifications.show({
      message: "Nenhum professor selecionado",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenancies/${tenancyId}/users/${item.id}`;

  // Optimistic UI update
  mutate &&
    (await mutate(
      (currentData) =>
        currentData?.map((s) =>
          s.id === item.id ? { ...s, active: !s.active } : s
        ) || [],
      { revalidate: false }
    ));

  notifications.show({
    title: "Aguarde",
    message: "Atualizando status do professor...",
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
                credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: !item.active }),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar o professor na API.");
    }

    notifications.clean();
    notifications.show({
      message: "Status atualizado com sucesso",
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: "Erro interno do servidor",
      color: "red",
    });
    // Reverte em caso de erro
    mutate && mutate();
  }
}

export default toggleUserActive;
