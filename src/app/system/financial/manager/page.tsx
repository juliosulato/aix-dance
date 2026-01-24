import AllBillsData from "@/modules/financial/manager/BillsList";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Bank } from "@/types/bank.types";
import { CategoryBill } from "@/types/category.types";
import { Supplier } from "@/types/supplier.types";

export default async function PayablePage() {
  const { user } = await requireAuth();
  const banks = await serverFetch<Bank[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user?.tenantId}/banks`
  );
  const suppliers = await serverFetch<Supplier[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user?.tenantId}/suppliers`
  );
  const categories = await serverFetch<CategoryBill[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user?.tenantId}/categories/bills`
  );

  return (
    <AllBillsData
      categories={categories.data}
      user={user}
      banks={banks.data}
      suppliers={suppliers.data}
    />
  );
}
