import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { StudentComplete } from "@/types/student.types";


async function toggleStudentActive(
  item: StudentComplete,
  tenancyId: string,
  mutate?: KeyedMutator<StudentComplete[]>
) {
  if (!item) {
    notifications.show({
      message: "Aluno não encontrado.",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenancies/${tenancyId}/students/${item.id}`;

  mutate &&
    (await mutate(
      (currentData) =>
        currentData?.map((s) =>
          s.id === item.id ? { ...s, active: !s.active } : s
        ) || [],
      { revalidate: false }
    ));

  notifications.show({
    title: "Aguarde",
    message: "Atualizando status do aluno...",
    color: "yellow",
  });

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
                credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: !item.active }),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar o aluno na API.");
    }

    notifications.clean();
    notifications.show({
      message: item.active ? "Aluno desativado com sucesso." : "Aluno ativado com sucesso.",
      color: "green",
    });
  } catch (error) {
    notifications.show({
      message: "Erro interno ao atualizar o aluno.",
      color: "red",
    });
    mutate && mutate();
  }
}

export default toggleStudentActive;
