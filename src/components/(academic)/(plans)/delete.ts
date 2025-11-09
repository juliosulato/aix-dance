import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Plan } from "@prisma/client";

type Item = Plan;
type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

async function deletePlans(
  items: string[] | string,
  tenancyId: string,
  mutate?: KeyedMutator<Item[] | PaginatedResponseLocal<Item>>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum plano selecionado para exclusão",
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/plans`;

  // Atualização otimista da UI (suporta array ou paginated response)
  if (mutate) {
    await mutate(
      (currentData: any) => {
        if (!currentData) return currentData;
        if (Array.isArray(currentData)) return currentData.filter((pm) => !idsToDelete.includes(pm.id));
        if (currentData.products && Array.isArray(currentData.products)) return { ...currentData, products: currentData.products.filter((pm: any) => !idsToDelete.includes(pm.id)) };
        return currentData;
      },
      { revalidate: false }
    );
  }

  notifications.show({
    title: "Aguarde...",
    message: "Excluindo planos...",
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: idsToDelete }),
    });

    if (!response.ok) {
      throw new Error("Falha ao desativar os planos na API.");
    }

    notifications.clean();
    notifications.show({
      message: "Planos excluídos com sucesso",
      color: "green",
    });
  } catch (err) {
    console.error(err);
    notifications.show({
      message: "Erro interno do sistema",
      color: "red",
    });
    // Reverte a UI em caso de erro
    if (mutate) await mutate();
  }
}

export default deletePlans;
