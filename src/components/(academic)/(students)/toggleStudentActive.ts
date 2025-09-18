import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Translations } from "@/types/translations";
import { StudentFromApi } from "./StudentFromApi";

async function toggleStudentActive(
  item: StudentFromApi,
  tenancyId: string,
  t: Translations,
  mutate?: KeyedMutator<StudentFromApi[]>
) {
  if (!item) {
    notifications.show({
      message: t("academic.students.toggle.errors.noStudent"),
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/students/${item.id}`;

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
    title: t("academic.students.toggle.notifications.wait.title"),
    message: t("academic.students.toggle.notifications.wait.message"),
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
      message: t("academic.students.toggle.notifications.success"),
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: t("academic.students.toggle.errors.internalError"),
      color: "red",
    });
    // Reverte em caso de erro
    mutate && mutate();
  }
}

export default toggleStudentActive;
