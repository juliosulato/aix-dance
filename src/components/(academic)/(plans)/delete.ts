import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Plan } from "@prisma/client";
import { Translations } from "@/types/translations";

async function deletePlans(
  items: Plan | string[],
  tenancyId: string,
  t: Translations,
  mutate?: KeyedMutator<Plan[]>
) {
  const isArray = Array.isArray(items);
  const idsToDelete = isArray ? items : [items.id];

  if (idsToDelete.length === 0) {
    notifications.show({
      message: t("academic.plans.delete.errors.noLength"),
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/plans`;

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
    title: t("academic.plans.delete.notifications.wait.title"),
    message: t("academic.plans.delete.notifications.wait.message"),
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
      message: t("academic.plans.delete.notifications.success"),
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: t("academic.plans.delete.errors.internalError"),
      color: "red",
    });
    // Reverte a UI em caso de erro
    mutate && mutate();
  }
}

export default deletePlans;
