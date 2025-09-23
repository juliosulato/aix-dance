import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Class } from "@prisma/client";

async function arquivarTurmas(
  idsParaArquivar: string[],
  tenancyId: string,
  mutate?: KeyedMutator<Class[]>
) {
  if (idsParaArquivar.length === 0) {
    notifications.show({
      message: "Nenhuma turma selecionada para arquivar.",
      color: "red",
    });
    return;
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/classes`;

  // Atualização otimista da UI: remove as turmas da lista visível
  mutate &&
    (await mutate(
      (dadosAtuais) =>
        dadosAtuais?.filter((c) => !idsParaArquivar.includes(c.id)) || [],
      {
        revalidate: false,
      }
    ));

  notifications.show({
    title: "Aguarde",
    message: "Arquivando turmas...",
    color: "yellow",
  });

  try {
    // Cria um array de promises, uma para cada requisição de arquivamento
    const promessasArquivar = idsParaArquivar.map((id) =>
      fetch(`${apiUrl}/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
    );

    // Executa todas as promises em paralelo
    const respostas = await Promise.all(promessasArquivar);

    // Verifica se alguma das requisições falhou
    const requisicaoFalhou = respostas.find((res) => !res.ok);
    if (requisicaoFalhou) {
      throw new Error(
        `Falha ao arquivar uma ou mais turmas. Status: ${requisicaoFalhou.status}`
      );
    }

    notifications.clean();
    notifications.show({
      message: "Turmas arquivadas com sucesso!",
      color: "green",
    });

    // Revalida os dados do SWR para garantir consistência, mas não reverte a UI otimista
    mutate && mutate();
  } catch (error) {
    console.error("Erro ao arquivar turmas:", error);
    notifications.show({
      message: "Ocorreu um erro interno ao arquivar as turmas.",
      color: "red",
    });
    // Reverte a UI em caso de erro, trazendo as turmas de volta
    mutate && mutate();
  }
}

export default arquivarTurmas;
