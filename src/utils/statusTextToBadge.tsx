import { Translations } from "@/types/translations";
import { Tooltip } from "@mantine/core";
import { BillStatus } from "@prisma/client";

export function StatusTextToBadge(
    status: BillStatus | string,
    tooltip: boolean = false,
    t: Translations,
    size?: string
) {
    const classes = `${size ? size : "w-4 h-4"} rounded-full`;

    switch (status) {
        case "PENDING":
            return tooltip ? (
                <Tooltip label={t("financial.bills.modals.status.PENDING")} color="yellow">
                    <div className={`${classes} bg-yellow-500`}></div>
                </Tooltip>
            ) : (
                <div className={`${classes} bg-yellow-500`}></div>
            );

        case "OVERDUE":
            return tooltip ? (
                <Tooltip label={t("financial.bills.modals.status.OVERDUE")} color="red">
                    <div className={`${classes} bg-red-500`}></div>
                </Tooltip>
            ) : (
                <div className={`${classes} bg-red-500`}></div>
            );
        case "CANCELLED":
            return tooltip ? (
                <Tooltip label={t("financial.bills.modals.status.CANCELLED")} color="gray">
                    <div className={`${classes} bg-gray-500`}></div>
                </Tooltip>
            ) : (
                <div className={`${classes} bg-red-500`}></div>
            );

        case "PAID":
            return tooltip ? (
                <Tooltip label={t("financial.bills.modals.status.PAID")} color="green">
                    <div className={`${classes} bg-green-500`}></div>
                </Tooltip>
            ) : (
                <div className={`${classes} bg-green-500`}></div>
            );

        default:
            return null;
    }
}

export default function StatusEnglishToBrazilianPortuguese(
    status: BillStatus | string
) {
    switch (status) {
        case "ACTIVE":
            return "Ativo";
            break;
        case "INACTIVE":
            return "Inativo";
            break;
        case "Pending":
            return "Pendente";
            break;
        case "Overdue":
            return "Atrasado";
            break;
        case "Paid":
            return "Pago";
            break;

        case "inStock":
            return "Em Estoque";
            break;
        case "noStock":
            return "Sem Estoque";
            break;
        case "Open":
            return "Em Aberto";
            break;
        case "InProgress":
            return "Em Andamento";
            break;
        case "Completed":
            return "Concluídas";
            break;
        case "Cancelled":
            return "Canceladas";
            break;
        case "Scheduled":
            return "Agendado";
            break;
    }
}
