import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Translations } from "@/types/translations";
import { TeacherFromApi } from "./modals/UpdateTeacher";

async function toggleUserActive(
  item: TeacherFromApi,
  tenancyId: string,
  t: Translations,
  mutate?: KeyedMutator<TeacherFromApi[]>
) {
  if (!item) {
    notifications.show({
      message: t("academic.users.toggle.errors.noStudent"),
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users/${item.id}`;

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
    title: t("academic.users.toggle.notifications.wait.title"),
    message: t("academic.users.toggle.notifications.wait.message"),
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: !item.active }),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar o estudante na API.");
    }

    notifications.clean();
    notifications.show({
      message: t("academic.users.toggle.notifications.success"),
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: t("academic.users.toggle.errors.internalError"),
      color: "red",
    });
    // Reverte em caso de erro
    mutate && mutate();
  }
}

export default toggleUserActive;
