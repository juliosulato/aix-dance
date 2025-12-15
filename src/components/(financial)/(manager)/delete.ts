import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { BillFromApi } from "./modals/UpdateBill";
import { authedFetch } from "@/utils/authedFetch";

type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

async function deleteBills(
    items: BillFromApi | string[],
    tenancyId: string,
    mutate?: KeyedMutator<BillFromApi[] | PaginatedResponseLocal<BillFromApi>>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Nenhum item selecionado para exclusão.", color: "red" });
        return;
    }

    const apiUrl = `/api/v1/tenancies/${tenancyId}/bills`;

  
    if (mutate) {
        mutate();
    }

    notifications.show({ title: "Aguarde...", message: "Estamos excluindo os itens selecionados.", color: "yellow" });

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
        notifications.show({ message: "Itens excluídos com sucesso.", color: "green" });
        
    } catch (error) {
        console.error("Erro ao excluir itens:", error);
        notifications.show({ message: "Erro interno ao excluir itens.", color: "red" });
        if (mutate) {
            mutate();
        }
    }
}

export default deleteBills;