"use client";

import { Text } from "@mantine/core";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";
import { Product } from "@/types/product.types";
import ProductFormModal from "@/modules/inventory/products/ProductFormModal";
import { MenuItem } from "./ProductsRowMenu";
import { MenuItems } from "./ProductsBulkMenu";
import { useCrud } from "@/hooks/useCrud";
import { deleteProductsAction } from "@/actions/inventory/products.actions";
import { SessionData } from "@/lib/auth-server";
import { productColumns } from "./ProductsColumns";
import ProductsCard from "./ProductsCard";

type Props = {
  user: SessionData["user"];
  products: Product[];
};

export default function ProductsList({ user, products }: Props) {
  const crud = useCrud<Product>({ deleteAction: deleteProductsAction });

  return (
    <>
      <DataView<Product>
        data={products}
        openNewModal={{
          func: crud.handleCreate,
          label: "Novo Produto",
        }}
        baseUrl="/system/inventory/products/"
        key={"data"}
        onPageChange={(p, l, sort) => {
          crud.pages.setPage(p);
          crud.pages.setLimit(l);
          if (sort) {
            crud.pages.setSortKey(String(sort.key as string));
            crud.pages.setSortDir(sort.direction);
          }
        }}
        pageTitle={"Produtos"}
        searchPlaceholder={"Pesquise pelo SKU, nome ou descrição..."}
        columns={productColumns}
        RenderRowMenu={(item) => (
          <MenuItem
            product={item}
            onUpdateClick={crud.handleUpdate}
            onDeleteClick={crud.handleDelete}
            tenancyId={user.tenancyId ?? ""}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkDeleteClick={crud.handleBulkDelete}
          />
        )}
        renderCard={(item) => <ProductsCard handleDelete={crud.handleDelete}  handleUpdate={crud.handleUpdate} item={item} tenancyId={user.tenancyId}/>}
      />

      <ProductFormModal
        key={`create-${crud.formVersion}`}
        opened={crud.modals.create}
        onClose={crud.closeModals.create}
      />

      {crud.selectedItem && (
        <ProductFormModal
          key={`update-${crud.formVersion}`}
          opened={crud.modals.update}
          onClose={crud.closeModals.update}
          isEditing={crud.selectedItem}
        />
      )}

      <ConfirmationModal
        opened={crud.modals.delete}
        onClose={crud.closeModals.delete}
        onConfirm={crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {crud.idsToDelete.length > 0
          ? `Tem certeza que deseja excluir
           estes ${crud.idsToDelete.length} produtos?`
          : `Tem certeza que deseja excluir
           este produto?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação não pode ser desfeita."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
