"use client";

import { fetcher } from "@/utils/fetcher";
import { useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import { Text, Tabs, Button, LoadingOverlay } from "@mantine/core";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataView from "@/components/ui/DataView";

import dayjs from "dayjs";
import PayBill from "./PayBill";
import { BillComplete } from "@/types/bill.types";
import { SessionData } from "@/lib/auth-server";
import { useCrud } from "@/hooks/useCrud";
import { deleteBills } from "@/actions/financial/bills.actions";
import { billListColumns } from "./billListColumns";
import BillRowMenu from "./BillRowMenu";
import BillCard from "./BillCard";
import BillBulkMenu from "./BillBulkMenu";
import { useBillsData } from "@/hooks/financial/useBillsData";
import { Bank } from "@/types/bank.types";
import { Supplier } from "@/types/supplier.types";
import { CategoryBill } from "@/types/category.types";
import { PaginatedListResponse } from "@/utils/pagination";
import BillFormModal from "./BillFormModal/BillFormModal";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { AppError } from "@/lib/AppError";

type Props = {
  user: SessionData["user"];
  banks: Bank[];
  suppliers: Supplier[];
  categories: CategoryBill[];
};

type MutateType = KeyedMutator<BillComplete[]>;

export default function BillsList({
  user,
  banks,
  suppliers,
  categories,
}: Props) {
  
  const [activeTab, setActiveTab] = useState<string | null>("payable");
  const { data, error, isLoading, mutate } = useSWR<
    PaginatedListResponse<BillComplete>
  >(`/api/v1/tenancies/${user.tenancyId}/bills?type=${activeTab?.toUpperCase()}`, fetcher);
  const billsData = useBillsData(data?.data || []);

  const [openPayBill, setOpenPayBill] = useState<boolean>(false);
  const [deleteScope, setDeleteScope] = useState<"ONE" | "ALL_FUTURE">("ONE");

  const handleDeleteAction = async (ids: string[]) => {
    if (ids.length === 1) {
      return deleteBills({
        id: ids[0],
        scope: deleteScope,
      });
    }

    return deleteBills(ids);
  };

  const handlePrepareDelete = (
    bill: BillComplete,
    scope: "ONE" | "ALL_FUTURE" = "ONE"
  ) => {
    setDeleteScope(scope);
    crud.handleDelete(bill);
  };

  const crud = useCrud<BillComplete>({
    deleteAction: handleDeleteAction,
    mutate: mutate as MutateType,
  });

  if (error) {
    throw new AppError(error, "500")
  }

  if (isLoading) {
    return <LoadingOverlay visible />;
  }
  
  return (
    <main>
      <div className="flex gap-4 justify-between items-center">
      <Breadcrumps
        items={["Início", "Financeiro"]}
        menu={[
          { label: "Resumo", href: "/system/summary" },
          { label: "Gerenciador", href: "/system/financial/manager" },
          {
            label: "Formas de Recebimento",
            href: "/system/financial/forms-of-receipt",
          },
          { label: "Categorias", href: "/system/financial/categories" },
          { label: "Grupos", href: "/system/financial/category-groups" },
          {
            label: "Contas Bancárias",
            href: "/system/financial/banks",
          },
          { label: "Relatórios", href: "/system/financial/reports" },
        ]}
      />
        <Tabs
        variant="pills"
        classNames={{
          tab: "!px-6 !py-4 font-medium! !rounded-2xl",
          root: "p-1! !bg-white !rounded-2xl shadow-sm",
        }}
        value={activeTab}
        keepMounted={false}
        onChange={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab value="payable">{"A Pagar"}</Tabs.Tab>
          <Tabs.Tab value="receivable">{"A Receber"}</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      </div>
      <br />
      

      <DataView<BillComplete>
        data={billsData}
        openNewModal={activeTab === "payable" ? {
          label: "Nova Cobrança",
          func: crud.handleCreate,
        } : undefined}
        key={"items"}
        baseUrl="/system/financial/manager/"
        mutate={mutate}
        pageTitle={`${"Contas"}`}
        searchPlaceholder={"Pesquisar contas..."}
        columns={billListColumns}
        RenderRowMenu={(item) => (
          <BillRowMenu
            bill={item}
            onUpdateClick={crud.handleUpdate}
            onDeleteClick={handlePrepareDelete}
            setOpenPayBill={() => setOpenPayBill(true)}
            setSelectedItems={crud.setSelectedItem}
          />
        )}
        RenderAllRowsMenu={(selectedIds) => (
          <BillBulkMenu
            selectedIds={selectedIds}
            onBulkDeleteClick={(ids) => {
              setDeleteScope("ONE");
              crud.handleBulkDelete(ids);
            }}
          />
        )}
        renderCard={(item: BillComplete) => (
          <BillCard crud={crud} item={item} setOpenPayBill={setOpenPayBill} />
        )}
      />

      <BillFormModal
        key={`new-${crud.formVersion}`}
        opened={crud.modals.create}
        onClose={crud.closeModals.create}
        mutate={mutate as MutateType}
        banks={banks}
        suppliers={suppliers}
        categories={categories}
        user={user}
      />

      {crud.selectedItem && (
        <BillFormModal
          key={`update-${crud.formVersion}`}
          opened={crud.modals.update}
          onClose={crud.closeModals.update}
          mutate={mutate as MutateType}
          banks={banks}
          categories={categories}
          suppliers={suppliers}
          user={user}
          isEditing={crud.selectedItem}
        />
      )}

      {crud.selectedItem && (
        <PayBill
          banks={banks}
          opened={openPayBill}
          onClose={() => {
            setOpenPayBill(false);
            crud.setSelectedItem(null);
          }}
          bill={crud.selectedItem}
          mutate={mutate as MutateType}
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
          ? "Tem certeza que deseja excluir as contas selecionadas?"
          : deleteScope === "ALL_FUTURE"
          ? `Tem certeza que deseja excluir ESTA conta (${dayjs(
              crud.selectedItem?.dueDate
            ).format("DD/MM/YYYY")}) e TODAS as futuras desta série?`
          : `Tem certeza que deseja excluir a conta com vencimento em ${
              dayjs(crud.selectedItem?.dueDate).format("DD/MM/YYYY") || ""
            }?`}

        <br />
        <Text component="span" c="red" size="sm" fw={500} mt="md">
          Aviso: ação irreversível.
        </Text>
      </ConfirmationModal>
    </main>
  );
}
