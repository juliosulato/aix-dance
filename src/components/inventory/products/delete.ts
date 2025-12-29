import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Product } from "@/types/product.types";

async function deleteProducts(
  items: Product | string[],
  tenancyId: string,
  mutate?: KeyedMutator<Product[]>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items.id];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: "Nenhum produto selecionado para exclusão",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenancies/${tenancyId}/inventory/products`;

  notifications.show({
    title: "Aguarde...",
    message: "Excluindo produtos...",
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
      throw new Error("Falha ao excluir os produtos na API.");
    }

    notifications.clean();
    notifications.show({
      message: "Produtos excluídos com sucesso",
      color: "green",
    });
  } catch (error) {
    console.error(error);
    notifications.show({
      message: "Erro interno do sistema",
      color: "red",
    });
  } finally {
    if (mutate) {
      mutate();
    }
  }
}

export default deleteProducts;
