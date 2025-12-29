import { KeyedMutator } from "swr";
import { FormsOfReceipt } from ".";
import { notifications } from "@mantine/notifications";


async function deleteFormsOfReceipt(
    items: FormsOfReceipt | string[],
    tenancyId: string,
    mutate?: KeyedMutator<FormsOfReceipt[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Nenhum item selecionado para deletar.", color: "red" });
        return;
    }

    const apiUrl = `/api/v1/tenancies/${tenancyId}/forms-of-receipt`;

    mutate && await mutate(
        (currentData) => currentData?.filter(pm => !idsToDelete.includes(pm.id)) || [],
        {
            revalidate: false,
        }
    );

    notifications.show({ title: "Aguarde!", message: "Deletando itens...", color: "yellow" });

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
        
        if (isArray) {
            notifications.show({ message: "Formas de Recebimento deletadas com sucesso!", color: "green" });
        } else {
            notifications.show({ message: "Forma de pagamento deletada com sucesso!", color: "green" });
        }

    } catch (error) {
        notifications.show({ message: "Ocorreu um erro ao deletar. Suas alterações foram desfeitas.", color: "red" });
        mutate && mutate();
    }
}

export default deleteFormsOfReceipt;