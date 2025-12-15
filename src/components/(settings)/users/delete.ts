import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { UserFromApi } from "./UserFromApi";
import { authedFetch } from "@/utils/authedFetch";

type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

async function deleteUsers(
  items: string[] | { id?: string },
  tenancyId: string,
  mutate?: KeyedMutator<UserFromApi[] | PaginatedResponseLocal<UserFromApi>>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items as string[] : [(items as { id?: string }).id].filter(Boolean) as string[];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum usuário selecionado para exclusão.",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenancies/${tenancyId}/users`;

  // Atualização otimista da UI (simples: revalidate)
  if (mutate) {
    mutate();
  }
  
  notifications.show({
    title: "Aguarde...",
    message: "Estamos excluindo os usuários selecionados.",
    color: "yellow",
  });

  try {
    const response = await authedFetch(apiUrl, {
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
