import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader, Center } from "@mantine/core";
import ContractAuditView from "./ContractAuditView";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function ViewContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/v1/contracts/view/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const contract = await res.json();

  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader />
        </Center>
      }
    >
      <ContractAuditView contract={contract as any} />
    </Suspense>
  );
}
