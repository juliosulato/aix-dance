import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { CategoryGroup } from "@prisma/client";import { authedFetch } from "@/utils/authedFetch";
async function deleteCategoryGroups(
    items: CategoryGroup | string[],
    tenancyId: string,
    mutate?: KeyedMutator<CategoryGroup[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Nenhum item selecionado para exclusão.", color: "red" });
        return;
    }

    const apiUrl = `/api/v1/tenancies/${tenancyId}/category-groups`;

    if (mutate) {
        mutate();
    }

    notifications.show({ title: "Aguarde", message: "Processando exclusão...", color: "yellow" });

    try {
        const response = await authedFetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: idsToDelete }),
        });

        if (!response.ok) {
            throw new Error('Falha ao deletar os itens na API.');
        }

    notifications.clean();
    } catch (error) {
        console.error("Erro ao excluir os itens:", error);
        notifications.show({ message: "Erro interno ao excluir os itens.", color: "red" });
        if (mutate) {
            mutate();
        }
    }
};

export default deleteCategoryGroups;