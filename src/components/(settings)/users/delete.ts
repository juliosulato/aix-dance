import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Plan } from "@prisma/client";

async function deleteUsers(
  items: Plan | string[],
  tenancyId: string,
  mutate?: KeyedMutator<Plan[]>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items.id];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum usuário selecionado para exclusão.",
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users`;

  // Atualização otimista da UI
  if (mutate) {
    mutate();
  }
  
  notifications.show({
    title: "Aguarde...",
    message: "Estamos excluindo os usuários selecionados.",
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
      message: "Usuários excluídos com sucesso.",
      color: "green",
    });
  } catch (error) {
    console.error("Erro ao excluir itens:", error);
    notifications.show({
      message: "Erro interno ao excluir usuários.",
      color: "red",
    });
    if (mutate) { 
        mutate();
    }
  }
}

export default deleteUsers;
