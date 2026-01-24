import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import ProductsList from "@/modules/inventory/products/ProductList";

export default async function ProductsPage() {
  const { user } = await requireAuth();
  const products = await serverFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/inventory/products`, {
    next: {
      tags: ["products"]
    }
  });

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
      <ProductsList products={products?.data ?? []} user={user}/>
    </main>
  );
}
