"use client";

import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import deleteProducts from "./delete";
import {
  ActionIcon,
  Badge,
  Group,
  LoadingOverlay,
  Menu,
  Text,
} from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewProduct from "./NewProduct";
import ProductFromAPI from "@/types/productFromAPI";
import UpdateProduct from "./UpdateProduct";

interface MenuItemProps {
  products: ProductFromAPI;
  onUpdateClick: (b: ProductFromAPI) => void;
  onDeleteClick: (b: ProductFromAPI) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllProductsData() {
  const { data: sessionData, status } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ProductFromAPI | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<{
    products: ProductFromAPI[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(
    () =>
      sessionData?.user?.tenancyId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/inventory/products?page=${page}&limit=${limit}${sortKey ? `&sortKey=${encodeURIComponent(sortKey)}` : ''}${sortDir ? `&sortDir=${encodeURIComponent(sortDir)}` : ''}`
        : null,
    fetcher
  );

  const handleUpdateClick = (product: ProductFromAPI) => {
    setSelected(product);
    setUpdateModalOpen(true);
  };

  const handleDeleteClick = (product: ProductFromAPI) => {
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

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (status !== "authenticated") return <div>{"Acesso não autorizado"}</div>;
  if (error) return <p>{"Erro ao carregar os produtos."}</p>;

  return (
    <>
      <DataView<ProductFromAPI>
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
            key: "inventory",
            label: "Quantidade",
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
            <div className="flex flex-row justify-between items-start">
              <Group>
                <Text fw={500} size="lg">
                  {item.name}
                </Text>
                <Badge color={item.isActive ? "green" : "red"}>
                  {item.isActive ? "Ativo" : "Inativo"}
                </Badge>
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
                <strong>{"Quantidade"}:</strong> {item.inventory}
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
