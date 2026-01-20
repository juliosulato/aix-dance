import { Product } from "@/types/product.types";
import { Avatar, Badge, Group, Text } from "@mantine/core";
import { MenuItem } from "./ProductsRowMenu";

type Props = {
    item: Product;
    handleUpdate: (item: Product) => void;
    handleDelete: (item: Product) => void;
    tenancyId: string;
}

export default function ProductsCard({ item, handleUpdate, handleDelete, tenancyId }: Props) {
  return (
    <>
      <div className="flex flex-row justify-between items-start gap-3 p-4">
        <Group gap="sm">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <Avatar radius="xl" color="violet">
              {item.name?.[0] ?? ""}
            </Avatar>
          )}
          <div className="flex flex-col">
            <Text fw={500} size="lg">
              {item.name}
            </Text>
            <Badge color={item.isActive ? "green" : "red"}>
              {item.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </Group>
        <MenuItem
          product={item}
          onUpdateClick={handleUpdate}
          onDeleteClick={handleDelete}
          tenancyId={tenancyId ?? ""}
        />
      </div>
      <div className="flex flex-row justify-between items-start p-4">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(item.price))}
        <span>
          <strong>{"Quantidade"}:</strong> {item.stock}
        </span>
      </div>
    </>
  );
}
