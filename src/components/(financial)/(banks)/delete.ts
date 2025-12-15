import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { Bank } from "@prisma/client";

async function deleteBanks(
    items: Bank | string[],
    tenancyId: string,
    mutate?: KeyedMutator<Bank[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Nenhum banco selecionado para exclusão.", color: "red" });
        return;
    }

    const apiUrl = `/api/v1/tenancies/${tenancyId}/banks`;

    mutate && await mutate(
        (currentData) => currentData?.filter(pm => !idsToDelete.includes(pm.id)) || [],
        {
            revalidate: false,
        }
    );

    notifications.show({ title: "Aguarde", message: "Excluindo conta(s) bancária(s)...", color: "yellow" });

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
    notifications.show({ message: "Conta(s) bancária(s) excluída(s) com sucesso.", color: "green" });
        
    } catch (error) {
        notifications.show({ message: "Erro interno ao excluir conta(s) bancária(s).", color: "red" });
        mutate && mutate();
    }
}

export default deleteBanks;