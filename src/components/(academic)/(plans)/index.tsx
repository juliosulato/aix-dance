"use client";

import { fetcher } from "@/utils/fetcher";
import { Plan, PlanType } from "@/types/plan.types";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import useSWR from "swr";
import deletePlans from "./delete";
import { ActionIcon, LoadingOverlay, Menu, Text } from "@mantine/core";
import { BiDotsVerticalRounded, BiTrash } from "react-icons/bi";
import { GrUpdate } from "react-icons/gr";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import NewPlan from "./modals/NewPlan";
import UpdatePlan from "./modals/UpdatePlan";

interface MenuItemProps {
  plans: Plan;
  onUpdateClick: (b: Plan) => void;
  onDeleteClick: (b: Plan) => void;
}

interface MenuItemsProps {
  selectedIds: string[];
  onBulkDeleteClick: (ids: string[]) => void;
}

export default function AllPlansData() {
  const { data: sessionData, isPending } = useSession();

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  type Item = Plan;
  type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };
  type PaginatedResponseLocal<T> = { products: T[]; pagination: PaginationInfo };

  const {
    data: categoryGroups,
    error,
    isLoading,
    mutate,
  } = useSWR<Item[] | PaginatedResponseLocal<Item>>(
    () =>
      sessionData?.user?.tenancyId
        ? `/api/v1/tenancies/${sessionData.user.tenancyId}/plans`
        : null,
    async (url: string) => {
      const res = await fetcher<any>(url);
      const itemsRaw: Plan[] = Array.isArray(res)
        ? res
        : res.plans ?? res.items ?? res.data ?? res.products ?? [];
      if (Array.isArray(res)) return itemsRaw;
      const pagination = res.pagination ?? { page: 1, limit: itemsRaw.length || 10, total: itemsRaw.length, totalPages: 1 };
      return { products: itemsRaw, pagination } as PaginatedResponseLocal<Item>;
    }
  );

  const handleUpdateClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIdsToDelete([]);
    setConfirmModalOpen(true);
  };

  const handleBulkDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setSelectedPlan(null);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    const tenancyId = sessionData?.user?.tenancyId;
    if (!tenancyId) return;

    const finalIdsToDelete =
      idsToDelete.length > 0
        ? idsToDelete
        : selectedPlan
        ? [selectedPlan.id]
        : [];

    if (finalIdsToDelete.length === 0) {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      return;
    }

    try {
  await deletePlans(finalIdsToDelete, tenancyId, mutate);
    } catch (error) {
      console.error("Falha ao excluir a(s) forma(s) de pagamento:", error);
    } finally {
      setIsDeleting(false);
      setConfirmModalOpen(false);
      setSelectedPlan(null);
      setIdsToDelete([]);
    }
  };

  const MenuItem = ({ plans, onUpdateClick, onDeleteClick }: MenuItemProps) => (
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
            onClick={() => onUpdateClick(plans)}
          >
            {"Editar"}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<BiTrash size={14} />}
            onClick={() => onDeleteClick(plans)}
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

  const renderCicle = (val: PlanType) => {
    switch (val) {
      case "MONTHLY":
        return "Mensal";
        break;
      case "SEMMONTLY":
        return "Quinzenal";
        break;
      case "BI_MONTHLY":
        return "Bimestral";
        break;
      case "QUARTERLY":
        return "Trimestral";
        break;
      case "BI_ANNUAL":
        return "Semestral";
        break;
      case "ANNUAL":
        return "Anual";
        break;
      default:
        return "";
        break;
    }
  };

  if (status === "loading" || isLoading) return <LoadingOverlay visible />;
  if (!sessionData) return <div>Sessão inválida</div>; return <div>{"Acesso não autorizado"}</div>;
  if (error) return <p>{"Erro ao carregar os planos."}</p>;

  return (
    <>
      <DataView<Plan>
        data={categoryGroups || []}
        openNewModal={{
          func: () => setOpenNew(true),
          label: "Novo Plano",
        }}
        baseUrl="/system/academic/plans/"
        mutate={mutate}
        pageTitle={"Planos"}
        searchPlaceholder={"Pesquisar planos..."}
        columns={[
          { key: "name", label: "Nome", sortable: true },
          {
            key: "amount",
            label: "Valor",
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
            key: "frequency",
            label: "Frequência",
            sortable: true,
            render: (value) => `${value} ${"parcelas"}`,
          },
          {
            key: "type",
            label: "Tipo",
            sortable: true,
            render: (value) => renderCicle(value),
          },
        ]}
        RenderRowMenu={(item) => (
          <MenuItem
            plans={item}
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
              <Text fw={500} size="lg">
                {item.name}
              </Text>
              <MenuItem
                plans={item}
                onUpdateClick={handleUpdateClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>
            <div className="flex flex-row justify-between items-start">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(item.amount))}
              <span>
                <strong>{"Tipo"}:</strong> {renderCicle(item.type)}
              </span>
            </div>
          </>
        )}
      />

      <NewPlan
        opened={openNew}
        onClose={() => setOpenNew(false)}
        mutate={mutate as any}
      />

      {selectedPlan && (
        <UpdatePlan
          opened={openUpdate}
          onClose={() => {
            setOpenUpdate(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          mutate={mutate as any}
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
          ? `Tem certeza que deseja desativar estes ${idsToDelete.length} planos?`
          : `Tem certeza que deseja desativar este plano?`}
        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          {"Essa ação não pode ser desfeita."}
        </Text>
      </ConfirmationModal>
    </>
  );
}
