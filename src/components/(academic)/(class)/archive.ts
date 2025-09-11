import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Translations } from "@/types/translations";
import { Class } from "@prisma/client";

async function archiveClasses(
  idsToArchive: string[],
  tenancyId: string,
  t: Translations,
  mutate?: KeyedMutator<Class[]>
) {
  if (idsToArchive.length === 0) {
    notifications.show({
      message: t("academic.classes.archive.errors.noLength"),
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes`;

  // Atualização otimista da UI: remove as turmas da lista visível
  mutate &&
    (await mutate(
      (currentData) =>
        currentData?.filter((c) => !idsToArchive.includes(c.id)) || [],
      {
        revalidate: false,
      }
    ));

  notifications.show({
    title: t("academic.classes.archive.notifications.wait.title"),
    message: t("academic.classes.archive.notifications.wait.message"),
    color: "yellow",
  });

  try {
    // Cria um array de promises, uma para cada requisição de arquivamento
    const archivePromises = idsToArchive.map(id => 
      fetch(`${apiUrl}/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
    );
    
    // Executa todas as promises em paralelo
    const responses = await Promise.all(archivePromises);

    // Verifica se alguma das requisições falhou
    const failedRequest = responses.find(res => !res.ok);
    if (failedRequest) {
      throw new Error(`Falha ao arquivar uma ou mais turmas. Status: ${failedRequest.status}`);
    }

    notifications.clean();
    notifications.show({
      message: t("academic.classes.archive.notifications.success"),
      color: "green",
    });

    // Revalida os dados da SWR para garantir consistência, mas não reverte a UI otimista
    mutate && mutate();

  } catch (error) {
    console.error("Erro ao arquivar turmas:", error);
    notifications.show({
      message: t("academic.classes.archive.errors.internalError"),
      color: "red",
    });
    // Reverte a UI em caso de erro, trazendo as turmas de volta
    mutate && mutate();
  }
}

export default archiveClasses;
