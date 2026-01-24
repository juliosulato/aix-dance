import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { TeacherFromApi } from "./modals/UpdateTeacher";


type Item = TeacherFromApi & { fullName?: string };
type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

async function deleteUsers(
  items: string[] | string,
  tenantId: string,
  mutate?: KeyedMutator<Item[] | PaginatedResponseLocal<Item>>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum item selecionado para exclusão.",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenants/${tenantId}/users`;

  // Atualização otimista da UI (suporta array ou paginated response)
  if (mutate) {
    await mutate(
      (currentData: any) => {
        if (!currentData) return currentData;
        if (Array.isArray(currentData)) {
          return currentData.filter((pm) => !idsToDelete.includes(pm.id));
        }
        if (currentData.products && Array.isArray(currentData.products)) {
          return { ...currentData, products: currentData.products.filter((pm: any) => !idsToDelete.includes(pm.id)) };
        }
        return currentData;
      },
      { revalidate: false }
    );
  }

  notifications.show({
    title: "Aguarde...",
    message: "Excluindo os registros selecionados...",
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
                credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idsToDelete }),
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir os usuários na API.");
    }

    notifications.clean();
    notifications.show({
      message: "Registros excluídos com sucesso!",
      color: "green",
    });
  } catch (err) {
    console.error(err);
    notifications.show({
      message: "Ocorreu um erro interno. Tente novamente.",
      color: "red",
    });
    // Reverte a UI em caso de erro
    if (mutate) await mutate();
  }
}

export default deleteUsers;
