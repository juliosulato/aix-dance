import { Column } from "@/components/ui/DataView";
import { BillComplete, RecurrenceType } from "@/types/bill.types";
import dayjs from "dayjs";
import renderBillStatus from "./renderBillStatus";

export const billListColumns: Column<BillComplete>[] = [
  {
    key: "amount",
    label: "Valor",
    render: (value) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value),
    sortable: true,
  },
  {
    key: "complement",
    label: "Complemento",
    render: (value) => (value ? value : ""),
    sortable: true,
  },
  {
    key: "category",
    label: "Categoria",
    render: (category) => category?.name || "-",
    sortable: true,
  },

  {
    key: "amountPaid",
    label: "Pago",
    render: (value) =>
      value
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(value)
        : "-",
    sortable: true,
  },
  {
    key: "installmentNumber",
    label: "Parcela",
    render: (value) =>
      value ? (
        <span className="text-primary">{value}</span>
      ) : (
        <span className="text-primary">1</span>
      ),
    sortable: true,
  },
  {
    key: "description",
    label: "Descrição",
  },
  {
    key: "dueDate",
    label: "Vencimento",
    render: (value, item) => {
      if (item.recurrence === "MONTHLY") {
        return "Todo dia " + dayjs(value).format("DD") + " do mês ";
      }
      return dayjs(value).format("DD/MM/YYYY");
    },
    sortable: true,
  },
  {
    key: "bank",
    label: "Banco",
    render: (bank) => bank?.name || "-",
    sortable: true,
  },
  {
    key: "formsOfReceipt",
    label: "Forma de Recebimento",
    render: (formsOfReceipt) => formsOfReceipt?.name || "-",
    sortable: true,
  },
  {
    key: "recurrence",
    label: "Recorrência",
    render: (rec: RecurrenceType) => {
      switch (rec) {
        case "MONTHLY":
          return "Mensal";
          break;
        case "ANNUAL":
          return "Anual";
          break;
        case "BIMONTHLY":
          return "Bimestral";
          break;
        case "QUARTERLY":
          return "Trimestral";
          break;
        case "SEMIANNUAL":
          return "Semestral";
          break;
        case "NONE":
          return "";
          break;
        default:
          return "";
          break;
      }
    },
  },
  {
    key: "status",
    label: "Status",
    render: renderBillStatus,
    sortable: true,
  },
];
