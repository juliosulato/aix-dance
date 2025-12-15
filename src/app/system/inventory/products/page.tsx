import AllProductsData from "@/components/inventory/products/AllProductsData";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default function ProductsPage() {
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
      <AllProductsData/>
    </main>
  );
}
