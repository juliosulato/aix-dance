import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Student } from "@prisma/client";
import { authedFetch } from "@/utils/authedFetch";

type Item = Student & { fullName?: string };
type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { items: T[]; pagination: PaginationInfo };

async function deleteStudents(
  items: string[] | string,
  tenancyId: string,
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

  const apiUrl = `/api/v1/tenancies/${tenancyId}/students`;

  if (mutate) {
    await mutate(
      (currentData: any) => {
        if (!currentData) return currentData;
        if (Array.isArray(currentData)) return currentData.filter((pm) => !idsToDelete.includes(pm.id));
        if (currentData.items && Array.isArray(currentData.items)) {
          return { ...currentData, items: currentData.items.filter((pm: any) => !idsToDelete.includes(pm.id)) };
        }
        if ((currentData as any).products && Array.isArray((currentData as any).products)) {
          return { ...currentData, products: (currentData as any).products.filter((pm: any) => !idsToDelete.includes(pm.id)) };
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
      message: "Registros excluídos com sucesso!",
      color: "green",
    });
  } catch (err) {
    console.error(err);
    notifications.show({
      message: "Ocorreu um erro interno. Tente novamente.",
      color: "red",
    });
    if (mutate) await mutate();
  }
}

export default deleteStudents;
