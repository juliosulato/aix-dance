import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import ProductView from "@/modules/inventory/products/View";
import { ProductWithStockMovement } from "@/types/product.types";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAuth();
  const { id } = await params;
  
  const product = await serverFetch<ProductWithStockMovement>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/inventory/products/${id}`,
    {
      next: {
        tags: ["products"],
      },
    }
  );

  return (
    <main>
      <Breadcrumps
        items={["Início", "Estoque"]}
        menu={[
          { label: "Controle de Estoque", href: "/system/inventory/control" },
          { label: "Encomendas", href: "/system/inventory/orders" },
          { label: "Produtos", href: "/system/inventory/products" },
          { label: "Relatórios", href: "/system/inventory/reports" },
        ]}
      />
      <br />
      <ProductView product={product.data} user={user} />
    </main>
  );
}
