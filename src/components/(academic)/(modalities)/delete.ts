import { KeyedMutator } from "swr";
import { notifications } from "@mantine/notifications";
import { CategoryGroup } from "@prisma/client";
import { Translations } from "@/types/translations";

async function deleteModalities(
    items: CategoryGroup | string[],
    tenancyId: string,
    t: Translations,
    mutate?: KeyedMutator<CategoryGroup[]>,
) {
    const isArray = Array.isArray(items);
    const idsToDelete = isArray ? items : [items.id];

    if (idsToDelete.length === 0) {
        notifications.show({ message: t("settings.modalities.delete.errors.noLength"), color: "red" });
        return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/modalities`;

    mutate && await mutate(
        (currentData) => currentData?.filter(pm => !idsToDelete.includes(pm.id)) || [],
        {
            revalidate: false,
        }
    );

    notifications.show({ title: t("settings.modalities.delete.notifications.wait.title"), message:t("settings.modalities.delete.notifications.wait.message"), color: "yellow" });

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
        notifications.show({ message: t("settings.modalities.delete.notifications.success"), color: "green" });
        
    } catch (error) {
        notifications.show({ message: t("settings.modalities.delete.errors.internalError"), color: "red" });
        mutate && mutate();
    }
}

export default deleteModalities;