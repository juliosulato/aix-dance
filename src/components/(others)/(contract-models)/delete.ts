import { notifications } from "@mantine/notifications";
import { MutatorCallback } from "swr";

export default async function deleteContractModels(
    ids: string[],
    tenancyId: string,
    mutate: MutatorCallback
) {
    try {
        const response = await fetch(`/api/v1/tenancies/${tenancyId}/contract-models`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao excluir modelos");
        }
        
        notifications.show({
            title: "Sucesso!",
            message: "O(s) modelo(s) de contrato foram excluídos.",
            color: "green",
        });
        
        mutate();

    } catch (error) {
        console.error("Falha ao excluir:", error);
        notifications.show({
            title: "Erro",
            message: "Não foi possível excluir o(s) modelo(s). Tente novamente.",
            color: "red",
        });
    }
}
