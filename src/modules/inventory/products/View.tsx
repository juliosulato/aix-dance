"use client";

import { ProductWithStockMovement } from "@/types/product.types";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import InfoTerm from "@/components/ui/Infoterm";
import { Avatar } from "@mantine/core";
import {
  deleteProductsAction,
  bulkUpdateProductsStatusAction,
} from "@/actions/inventory/products.actions";
import { useCrud } from "@/hooks/useCrud";
import { SessionData } from "@/lib/auth-server";
import ProductFormModal from "./ProductFormModal";
import ViewStockMovements from "@/modules/inventory/products/StockMovements/ViewStockMovements";
import { notifications } from "@mantine/notifications";
import { startTransition } from "react";

export default function ProductView({
  user,
  product,
}: {
  user: SessionData["user"];
  product: ProductWithStockMovement;
}) {
  const crud = useCrud({ deleteAction: deleteProductsAction });

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await bulkUpdateProductsStatusAction(
        [product.id],
        !product.isActive
      );

      if (result.success) {
        notifications.show({ message: "Status atualizado com sucesso" });
      } else {
        notifications.show({ message: result.error, color: "red" });
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          {"Visualizar Produto"}
        </h1>
        <div className="flex gap-4 md:gap-6 items-center">
          <Avatar
            src={product?.image ?? undefined}
            alt={"Produto " + product.name}
          >
            {product.name}
          </Avatar>

          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={handleToggleActive}
            title={product.isActive ? "Desativar" : "Ativar"}
          >
            {product.isActive ? <FaToggleOff /> : <FaToggleOn />}
            <span>{product.isActive ? "Desativar" : "Ativar"}</span>
          </button>
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleDelete(product)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => crud.handleUpdate(product)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">
        {"Informações Básicas"}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoTerm label={"SKU"}>{product.sku}</InfoTerm>
        <InfoTerm label={"Nome"}>{product.name}</InfoTerm>
        <InfoTerm label={"Descrição"} className="md:col-span-2">
          {product.description || "-"}
        </InfoTerm>
        <InfoTerm label={"Código de Barras"} className="md:col-span-2">
          {product.barcode || "-"}
        </InfoTerm>
        <InfoTerm label={"Preço"}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(product?.price || 0))}
        </InfoTerm>
        <InfoTerm label={"Preço de Custo"}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(product?.priceOfCost || 0))}
        </InfoTerm>
        <InfoTerm label={"Estoque Mínimo"}>{product.minStock}</InfoTerm>
        <InfoTerm label={"Em Estoque"}>{product.stock}</InfoTerm>
        <InfoTerm label={"Categoria"}>{product.category?.name || "-"}</InfoTerm>
        <InfoTerm label={"Fornecedor"}>
          {product.supplier?.name || "-"}
        </InfoTerm>
      </div>
      <ViewStockMovements product={product} user={user} />

      <ProductFormModal
        isEditing={product}
        onClose={crud.closeModals.update}
        opened={crud.modals.update}
      />
      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={crud.closeModals.delete}
        onConfirm={crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        confirmColor="red"
        loading={crud.isDeleting}
      >
        Tem certeza que deseja excluir este produto?
      </ConfirmationModal>
    </div>
  );
}
