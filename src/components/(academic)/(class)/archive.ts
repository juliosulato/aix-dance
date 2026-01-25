import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import {Class} from "@/types/class.types";

type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

async function arquivarTurmas(
  idsParaArquivar: string[],
  tenantId: string,
  mutate?: KeyedMutator<Class[] | PaginatedResponseLocal<Class>>
) {
  if (idsParaArquivar.length === 0) {
    notifications.show({
      message: "Nenhuma turma selecionada para arquivar.",
      color: "red",
    });
    return;
  }

  const apiUrl = `/api/v1/tenants/${tenantId}/academic/classes`;

  // Atualização otimista da UI: remove as turmas da lista visível
  if (mutate) {
    await mutate(
      (dadosAtuais: any) => {
        if (!dadosAtuais) return dadosAtuais;
        if (Array.isArray(dadosAtuais)) return dadosAtuais.filter((c) => !idsParaArquivar.includes(c.id));
        if (dadosAtuais.products && Array.isArray(dadosAtuais.products)) return { ...dadosAtuais, products: dadosAtuais.products.filter((c: any) => !idsParaArquivar.includes(c.id)) };
        return dadosAtuais;
      },
      { revalidate: false }
    );
  }

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
  if (mutate) await mutate();
  } catch (error) {
    console.error("Erro ao arquivar turmas:", error);
    notifications.show({
      message: "Ocorreu um erro interno ao arquivar as turmas.",
      color: "red",
    });
  // Reverte a UI em caso de erro, trazendo as turmas de volta
  if (mutate) await mutate();
  }
}

export default arquivarTurmas;
