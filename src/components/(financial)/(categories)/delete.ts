import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";

import { CategoryGroup } from "@/types/bill.types";
import { getErrorMessage } from "@/utils/getErrorMessage";

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

    const apiUrl = `/api/v1/tenancies/${tenancyId}/category-bills`;


    notifications.show({ title: "Aguarde", message: "Excluindo item(s)...", color: "yellow" });

    try {
        const response = await fetch(apiUrl, {
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
        notifications.show({ message: "Itens excluídos com sucesso.", color: "green" });
        
    } catch (error: unknown) {
        notifications.show({ message: getErrorMessage(error, "Erro interno ao excluir os itens."), color: "red" });
    }

    if (mutate) {
        mutate();
    }
}

export default deleteCategoryGroups;