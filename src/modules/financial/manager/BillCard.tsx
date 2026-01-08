import { Badge, Box, Divider, Flex, Text } from "@mantine/core";
import BillRowMenu from "./BillRowMenu";
import renderBillStatus from "./renderBillStatus";
import { BillComplete } from "@/types/bill.types";
import { Dispatch, SetStateAction } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import dayjs from "dayjs";
import Decimal from "decimal.js";

type Props = {
  item: BillComplete;
  crud: any;
  setOpenPayBill: Dispatch<SetStateAction<boolean>>;
};

export default function BillCard({ item, crud, setOpenPayBill }: Props) {
 return (
     <Box className="flex flex-col h-full p-4">
    <Flex justify="space-between" align="start">
      {renderBillStatus(item.status)}
      <BillRowMenu
        bill={item}
        onUpdateClick={crud.handleUpdate}
        onDeleteClick={crud.handleDelete}
        setOpenPayBill={setOpenPayBill}
        setSelectedItems={crud.setSelectedItem}
      />
    </Flex>

    <Box className="grow my-4">
      <Text size="sm" c="dimmed">
        {item.category?.name || "Sem categoria"}
      </Text>
      <Text fw={500} lineClamp={2}>
        {item.description || "Sem descrição"}
      </Text>
    </Box>

    <Divider my="xs" />

    <Flex justify="space-between" align="center">
      <Text size="sm" c="dimmed">
        Vencimento
      </Text>
      <Flex align="center" gap="xs">
        <FaCalendarAlt className="text-gray-500" />
        <Text size="sm" fw={500}>
          {dayjs(item.dueDate).format("DD/MM/YYYY")}
        </Text>
      </Flex>
    </Flex>

    <Flex justify="space-between" align="center" mt="sm">
      <Text size="lg" fw={700} c="gray.8">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(item.amount instanceof Decimal ? item?.amount?.toNumber() : item.amount ?? 0)}
      </Text>
      {item.totalInstallments && item.totalInstallments > 1 && (
        <Badge variant="light" color="gray">
          {item.installmentNumber}
        </Badge>
      )}
    </Flex>
  </Box>
 );
}
