/* eslint-disable @typescript-eslint/no-unused-expressions */
import { notifications } from "@mantine/notifications";
import { authedFetch } from "@/utils/authedFetch";

export default async function toggleProductActive(
  productId: string,
  tenancyId: string,
  newStatus: boolean,
  mutate?: () => void
) {
  try {
    const res = await authedFetch(
      `/api/v1/tenancies/${tenancyId}/inventory/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Falha ao atualizar status do produto");
    }

    notifications.show({
      color: "green",
      message: newStatus
        ? "Produto ativado com sucesso."
        : "Produto desativado com sucesso.",
    });

    mutate && mutate();
  } catch (err) {
    notifications.show({
      color: "red",
      message: `Erro ao atualizar produto: ${(err as Error).message}`,
    });
    throw err;
  }
}
