"use client";

import ProductFromAPI from "@/types/productFromAPI";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import UpdateProduct from "./UpdateProduct";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteProducts from "./delete";
import InfoTerm from "@/components/ui/Infoterm";
import ViewStockMovements from "./ViewStockMovements";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Button } from "@mantine/core";
import toggleProductActive from "./toggleActive";
import ProductImageUpload from "./ProductImageUpload";

export default function ProductView({ id }: { id: string }) {
  // Local UI state
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const router = useRouter();

  const { data: sessionData } = useSession();
  const tenancyId = sessionData?.user.tenancyId as string;

  // Fetch product via SWR
  const {
    data: product,
    error,
    isLoading,
    mutate,
  } = useSWR<ProductFromAPI>(
    tenancyId && id
      ? `/api/v1/tenancies/${tenancyId}/inventory/products/${id}`
      : null,
    fetcher
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Chamando a função para desativar o plano
      await deleteProducts([product?.id || "-"], tenancyId);
      // Redireciona para a lista de produtos após a desativação
      window.location.href = "/system/inventory/products";
    } catch (error) {
      console.error("Falha ao desativar o produto:", error);
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  const handleToggleActive = async () => {
    if (!product?.id || !tenancyId) return;
    const newStatus = !product.isActive;
    await toggleProductActive(product.id, tenancyId, newStatus, mutate as any);
  };
  if (error) {
    return (
      <div className="p-6 bg-white rounded-3xl shadow-sm flex flex-col items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          Erro ao carregar produto
        </h1>
        <p className="text-neutral-600 text-center">
          Tente novamente mais tarde.
        </p>
        <Button
          color="#7439FA"
          radius="lg"
          size="lg"
          fullWidth={false}
          className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
          onClick={() => router.push("/system/inventory/products")}
        >
          Voltar para a lista de produtos
        </Button>
      </div>
    );
  }

  if (isLoading || !product) {
    return <div>Carregando...</div>;
  }

  // Handle API shape when product is not found, e.g. { error: "Product not found." }
  const productError = (product as unknown as { error?: string })?.error;

  if (productError) {
    return (
      <div className="p-6 bg-white rounded-3xl shadow-sm flex flex-col items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          Produto não encontrado
        </h1>
        <p className="text-neutral-600 text-center">
          {productError || "O produto solicitado não foi encontrado."}
        </p>
        <Button
          color="#7439FA"
          radius="lg"
          size="lg"
          fullWidth={false}
          className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
          onClick={() => router.push("/system/inventory/products")}
        >
          Voltar para a lista de produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          {"Visualizar Produto"}
        </h1>
        <div className="flex gap-4 md:gap-6 items-center">
          <ProductImageUpload
            productId={id}
            initialUrl={product.imageUrl ?? undefined}
            onUpdated={() => (mutate as any)()}
          />
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={handleToggleActive}
            title={product.isActive ? "Desativar" : "Ativar"}
          >
            {product.isActive ? (
              <FaToggleOff />
            ) : (
              <FaToggleOn />
            )}
            <span>{product.isActive ? "Desativar" : "Ativar"}</span>
          </button>
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setConfirmModalOpen(true)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setOpenUpdate(true)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      {/* Seção de Informações Básicas */}
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
          {product.barCode || "-"}
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
      <ViewStockMovements productId={id} productMutate={mutate as any} />

      {/* Modais de Ação */}
      <UpdateProduct
        product={product}
        onClose={() => setOpenUpdate(false)}
        opened={openUpdate}
        mutate={mutate as any}
      />
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        confirmColor="red"
        loading={isDeleting}
      >
        {" "}
        Tem certeza que deseja excluir este produto?
      </ConfirmationModal>
    </div>
  );
}
