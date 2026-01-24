import { Product } from "@/types/product.types";
import { ActionIcon, Menu } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import { bulkUpdateProductsStatusAction } from "@/actions/inventory/products.actions";

interface MenuItemProps {
  product: Product;
  onUpdateClick: (b: Product) => void;
  onDeleteClick: (b: Product) => void;
  tenantId: string;
}

export const MenuItem = ({
    product,
    onUpdateClick,
    onDeleteClick,
    tenantId
  }: MenuItemProps) => (
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
            onClick={() => onUpdateClick(product)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            leftSection={
              product.isActive ? (
                <FaToggleOff size={14} />
              ) : (
                <FaToggleOn size={14} />
              )
            }
            onClick={async () => {
              if (!tenantId) return;
              await bulkUpdateProductsStatusAction([product.id], !product.isActive);
            }}
          >
            {product.isActive ? "Desativar" : "Ativar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(product)}
          >
            {"Excluir"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );

