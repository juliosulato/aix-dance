/* eslint-disable @next/next/no-img-element */
"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR from "swr";
import deleteProducts from "./delete";
import {
  ActionIcon,
  Badge,
  Avatar,
  Group,
  LoadingOverlay,
  Menu,
  Text,
} from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewProduct from "./NewProduct";
import { Product } from "@/types/product.types";
import UpdateProduct from "./UpdateProduct";
import toggleProductActive from "./toggleActive";
import { is } from "zod/v4/locales";

interface MenuItemProps {
  products: Product;
  onUpdateClick: (b: Product) => void;
  onDeleteClick: (b: Product) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllProductsData() {
  const { data: sessionData, isPending } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/inventory/products?page=${page}&limit=${limit}${sortKey ? `&sortKey=${encodeURIComponent(sortKey)}` : ''}${sortDir ? `&sortDir=${encodeURIComponent(sortDir)}` : ''}`
        : null,
    fetcher
  );

  const handleUpdateClick = (product: Product) => {
    setSelected(product);
    setUpdateModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelected(product);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleBulkDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setSelected(null);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0 ? idsToDelete : selected ? [selected.id] : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
      await deleteProducts(finalIdsToDelete, tenancyId, mutate as any);
    } catch (error) {
      console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelected(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({
    products,
    onUpdateClick,
    onDeleteClick,
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
            onClick={() => onUpdateClick(products)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            leftSection={products.isActive ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
            onClick={async () => {
              const tenancyId = sessionData?.user?.tenancyId;
              if (!tenancyId) return;
              await toggleProductActive(
                products.id,
                tenancyId,
                !products.isActive,
                mutate as any
              );
            }}
          >
            {products.isActive ? "Desativar" : "Ativar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(products)}
          >
            {"Excluir"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );

  const MenuItems = ({ selectedIds, onBulkDeleteClick }: MenuItemsProps) => (
    <Menu shadow="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="light" color="gray" radius={"md"}>
          <BiDotsVerticalRounded />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{"Ações em Massa"}</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<BiTrash size={14} />}
          onClick={() => onBulkDeleteClick(selectedIds)}
        >
          Deletar {selectedIds.length} selecionado(s)
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  if (isPending || isLoading) return <LoadingOverlay visible />;
  if (error) return <p>{"Erro ao carregar os produtos."}</p>;

  return sessionData && (
    <>
      <DataView<Product>
        data={
          response || {
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          }
        }
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Novo Produto",
        }}
        baseUrl="/system/inventory/products/"
        mutate={mutate as any}
        onPageChange={(p, l, sort) => {
          setPage(p);
          setLimit(l);
          if (sort) {
            setSortKey(String(sort.key as string));
            setSortDir(sort.direction);
          }
        }}
        pageTitle={"Produtos"}
        searchbarPlaceholder={"Pesquise pelo SKU, nome ou descrição..."}
        columns={[
          {
            key: "image",
            label: "",
            sortable: false,
            render: (_, item) => (
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
              )
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
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            products={item}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <MenuItems
            selectedIds={selectedIds}
            onBulkDeleteClick={handleBulkDeleteClick}
          />
        )}
        renderCard={(item) => (
          <>
            <div className="flex flex-row justify-between items-start gap-3">
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
                products={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
            <div className="flex flex-row justify-between items-start">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(item.price))}
              <span>
                <strong>{"Quantidade"}:</strong> {item.stock}
              </span>
            </div>
          </>
        )}
      />

      <NewProduct
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selected && (
        <UpdateProduct
          opened={isUpdateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelected(null);
          }}
          product={selected}
          mutate={mutate}
        />
      )}

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {idsToDelete.length > 0
          ? `Tem certeza que deseja desativar estes ${idsToDelete.length} produtos?`
          : `Tem certeza que deseja desativar este produto?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação não pode ser desfeita."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
