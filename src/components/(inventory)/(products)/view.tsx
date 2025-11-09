"use client";

import ProductFromAPI from "@/types/productFromAPI";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import UpdateProduct from "./UpdateProduct";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteProducts from "./delete";
import InfoTerm from "@/components/ui/Infoterm";

export default function ProductView({ id }: { id: string }) {
  const [product, setProduct] = useState<null | ProductFromAPI>(null);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const router = useRouter();

  const { data: sessionData } = useSession();
  const tenancyId = sessionData?.user.tenancyId as string;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Chamando a função para desativar o plano
      await deleteProducts([product?.id || "-"], tenancyId);
      // Redireciona para a lista de produtos após a desativação
      router.push("/system/inventory/products");
      window.location.reload(); // Força a atualização dos dados na página de listagem
    } catch (error) {
      console.error("Falha ao desativar o produto:", error);
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };
  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData?.user.tenancyId}/inventory/products/${id}`
      );
      const data = await response.json();
      setProduct(data);
    };

    fetchProduct();
  }, [id, sessionData]);

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">
          {"Visualizar Produto"}
        </h1>
        <div className="flex gap-4 md:gap-6">
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
        <InfoTerm label={"Descrição"} className="md:col-span-2">{product.description || "-"}</InfoTerm>
        <InfoTerm label={"Código de Barras"} className="md:col-span-2">{product.barcode}</InfoTerm>
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

      {/* Modais de Ação */}
      <UpdateProduct
        product={product}
        onClose={() => setOpenUpdate(false)}
        opened={openUpdate}
        mutate={() => window.location.reload() as any}
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
