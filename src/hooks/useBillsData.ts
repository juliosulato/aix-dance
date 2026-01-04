import { BillComplete } from "@/types/bill.types";
import { PaginatedResponseLocal } from "@/types/pagination.types";
import { useMemo } from "react";

export function useBillsData(
  rawData?: BillComplete[],
  activeTab?: string | null
): BillComplete[] {
  const parentBills = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return rawData.products ?? rawData.bills ?? [];
  }, [rawData]);

  const allBills = useMemo(() => {
    const flat = parentBills.flatMap(parent => {
      const totalInstallments = (parent.children?.length || 0) + 1;
      return [
        { ...parent, totalInstallments },
        ...(parent.children?.map((child: BillComplete) => ({
          ...child,
          totalInstallments,
        })) || []),
      ];
    });

    const statusOrder: Record<string, number> = {
      OVERDUE: 0,
      AWAITING_RECEIPT: 1,
      PENDING: 2,
      PAID: 3,
      CANCELLED: 4,
    };

    return flat.sort((a, b) => {
      const aOrder = statusOrder[a.status ?? ""] ?? 99;
      const bOrder = statusOrder[b.status ?? ""] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [parentBills]);

  const filteredBills = useMemo(() => {
    if (!activeTab) return allBills;
    return allBills.filter(
      bill => bill.type?.toLowerCase() === activeTab
    );
  }, [allBills, activeTab]);

  return filteredBills;
}
