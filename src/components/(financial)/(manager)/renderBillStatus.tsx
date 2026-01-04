import { BillStatus } from "@/types/bill.types";
import { Badge } from "@mantine/core";

export default function renderBillStatus(status: BillStatus) {
    switch (status) {
        case "PENDING":
          return <Badge color="oklch(79.5% 0.184 86.047)">PENDENTE</Badge>;
          break;
        case "OVERDUE":
          return <Badge color="oklch(63.7% 0.237 25.331)">EM ATRASO</Badge>;
          break;
        case "CANCELLED":
          return <Badge color="oklch(55.1% 0.027 264.364)">CANCELADO</Badge>;
          break;
        case "AWAITING_RECEIPT":
          return (
            <Badge color="oklch(68.5% 0.169 237.323)">
              AGUARDANDO RECEBIMENTO
            </Badge>
          );
          break;
        case "PAID":
          return <Badge color="oklch(72.3% 0.219 149.579)">PAGO</Badge>;
          break;
      }
}