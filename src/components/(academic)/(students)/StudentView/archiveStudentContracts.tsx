import { notifications } from "@mantine/notifications";

import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

export default async function archiveStudentContracts(ids: string[], tenancyId: string) {
    try {
        const response = await fetch(`/api/v1/tenancies/${tenancyId}/student-contracts/archive`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            throw new Error('Falha ao arquivar o(s) contrato(s).');
        }

        notifications.show({
            title: "Sucesso!",
            message: "Contrato(s) arquivado(s) com sucesso.",
            color: "green",
            icon: <FaCheck/>,
        });

    } catch (error: any) {
        console.error("Erro ao arquivar contratos:", error);
        notifications.show({
            title: "Erro",
            message: error.message || "Ocorreu um erro inesperado.",
            color: "red",
            icon: <FaExclamationTriangle/>,
        });
        throw error;
    }
}
