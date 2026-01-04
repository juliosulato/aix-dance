import { BillComplete } from "@/types/bill.types";
import { ActionIcon, Menu } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

interface Props {
  bill: BillComplete;
  onUpdateClick: (b: BillComplete) => void;
  onDeleteClick: (b: BillComplete, scope?: "ONE" | "ALL_FUTURE") => void;
  setOpenPayBill: Dispatch<SetStateAction<boolean>>;
  setSelectedItems: (b: BillComplete) => void;
}

export default function BillRowMenu({
  bill,
  onUpdateClick,
  onDeleteClick,
  setOpenPayBill,
  setSelectedItems,
}: Props) {
  const isRecurrent = bill.recurrence !== "NONE" || !!bill.parentId || (bill.children && bill.children.length > 0) || bill.installments > 1;

  return (
    <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Menu shadow="md" width={200} withinPortal>
        <Menu.Target>
          <ActionIcon variant="light" color="gray" radius={"md"}>
            <BiDotsVerticalRounded />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{"Ações"}</Menu.Label>
          <Menu.Item
            leftSection={<GrUpdate size={14} />}
            onClick={() => onUpdateClick(bill)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            leftSection={<RiMoneyDollarCircleLine size={14} />}
            onClick={() => {
              setSelectedItems(bill);
              setOpenPayBill(true);
            }}
          >
            <span>{"Pagar"}</span>
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => {
              
              onDeleteClick(bill, "ONE")}}
          >
            {"Excluir"}
          </Menu.Item>

          {isRecurrent && (
            <Menu.Item
              color="red"
              leftSection={<BiTrash size={14} />}
              onClick={() => onDeleteClick(bill, "ALL_FUTURE")}
            >
              {"Excluir Todas Parcelas"}
            </Menu.Item>
          )}

        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
