import { Column } from "@/types/data-view.types";
import { Product } from "@/types/product.types";
import { Avatar, Badge } from "@mantine/core";

export const productColumns: Column<Product>[] = [
  {
    key: "image",
    label: "",
    sortable: false,
    minWidth: 40,
    render: (_, item) =>
      item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 rounded-2xl object-cover"
        />
      ) : (
        <Avatar radius="xl" color="violet">
          {item.name?.[0] ?? ""}
        </Avatar>
      ),
  },
  { key: "sku", label: "SKU", sortable: true },
  { key: "name", label: "Nome", sortable: true },
  {
    key: "price",
    label: "Preço",
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
    key: "priceOfCost",
    label: "Preço de Custo",
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
    key: "stock",
    label: "Em Estoque",
    sortable: true,
  },
  {
    key: "isActive",
    label: "Ativo",
    render: (value) =>
      value ? (
        <Badge color="green">ATIVO</Badge>
      ) : (
        <Badge color="red">INATIVO</Badge>
      ),
    sortable: false,
  },
];
