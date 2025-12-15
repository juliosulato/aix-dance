import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Supplier } from "@prisma/client";
import { authedFetch } from "@/utils/authedFetch";

async function deleteSuppliers(
    items: Supplier | string[],
    tenancyId: string,
    mutate?: KeyedMutator<Supplier[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Selecione pelo menos um fornecedor para excluir.", color: "red" });
        return;
    }

    const apiUrl = `/api/v1/tenancies/${tenancyId}/suppliers`;

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
        notifications.show({ message: "Fornecedor excluído com sucesso.", color: "green" });

    } catch (error) {
        console.error("Erro ao excluir os itens:", error);
        notifications.show({ message: "Erro interno ao excluir os itens.", color: "red" });
        if (mutate) {
            mutate();
        }
    }
}

export default deleteSuppliers;