import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Plan } from "@prisma/client";

async function deleteStudents(
  items: Plan | string[],
  tenancyId: string,
  mutate?: KeyedMutator<Plan[]>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items.id];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum item selecionado para exclusão.",
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students`;

  // Atualização otimista da UI
  mutate &&
    (await mutate(
      (currentData) =>
        currentData?.filter((pm) => !idsToDelete.includes(pm.id)) || [],
      {
        revalidate: false,
      }
    ));

  notifications.show({
    title: "Aguarde...",
    message: "Excluindo os registros selecionados...",
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idsToDelete }),
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir os estudantes na API.");
    }

    notifications.clean();
    notifications.show({
      message: "Registros excluídos com sucesso!",
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: "Ocorreu um erro interno. Tente novamente.",
      color: "red",
    });
    // Reverte a UI em caso de erro
    mutate && mutate();
  }
}

export default deleteStudents;
