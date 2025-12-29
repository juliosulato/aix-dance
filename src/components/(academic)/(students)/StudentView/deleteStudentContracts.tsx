import { notifications } from "@mantine/notifications";

import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

export default async function deleteStudentContracts(ids: string[], tenancyId: string) {
    try {
        const response = await fetch(`/api/v1/tenancies/${tenancyId}/student-contracts`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            throw new Error('Falha ao excluir o(s) contrato(s).');
        }

        notifications.show({
            title: "Sucesso!",
            message: "Contrato(s) excluído(s) com sucesso.",
            color: "green",
            icon: <FaCheck />,
        });

    } catch (error: any) {
        console.error("Erro ao excluir contratos:", error);
        notifications.show({
            title: "Erro",
            message: error.message || "Ocorreu um erro inesperado.",
            color: "red",
            icon: <FaExclamationTriangle />,
        });
        throw error; // Propaga o erro para ser tratado no componente
    }
}
