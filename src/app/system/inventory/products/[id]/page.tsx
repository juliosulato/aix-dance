import Breadcrumps from "@/components/ui/Breadcrumps";
import ProductView from "@/components/(inventory)/(products)/View";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      <ProductView id={id} />
    </main>
  );
}
