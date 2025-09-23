import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { BillFromApi } from "./modals/UpdateBill";

async function deleteBills(
    items: BillFromApi | string[],
    tenancyId: string,
    mutate?: KeyedMutator<BillFromApi[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: t("financial.bills.delete.errors.noLength"), color: "red" });
        return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/bills`;

    mutate && await mutate(
        (currentData) => currentData?.filter(pm => !idsToDelete.includes(pm.id)) || [],
        {
            revalidate: false,
        }
    );

    notifications.show({ title: t("financial.bills.delete.notifications.wait.title"), message:t("financial.bills.delete.notifications.wait.message"), color: "yellow" });

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
        notifications.show({ message: t("financial.bills.delete.notifications.success"), color: "green" });
        
    } catch (error) {
        notifications.show({ message: t("financial.bills.delete.errors.internalError"), color: "red" });
        mutate && mutate();
    }
}

export default deleteBills;