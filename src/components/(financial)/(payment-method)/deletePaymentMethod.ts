import { KeyedMutator } from "swr";
import { PaymentMethod } from ".";
import { notifications } from "@mantine/notifications";

async function deletePaymentMethod(
    items: PaymentMethod | string[],
    mutate: KeyedMutator<PaymentMethod[]>,
    tenancyId: string
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: "Nenhum item selecionado para deletar.", color: "red" });
        return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/payment-methods`;

    await mutate(
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
        notifications.show({ message: "Formas de pagamento deletadas com sucesso!", color: "green" });

    } catch (error) {
        notifications.show({ message: "Ocorreu um erro ao deletar. Suas alterações foram desfeitas.", color: "red" });
        mutate();
    }
}

export default deletePaymentMethod;