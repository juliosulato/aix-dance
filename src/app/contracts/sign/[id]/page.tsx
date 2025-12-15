import { notFound } from "next/navigation";
import SignContractView from "./SignContractView";
import { Suspense } from "react";
import { Loader, Center } from "@mantine/core";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function SignContractPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const headersList = headers();
  const ip = (await headersList).get("x-forwarded-for") ?? "IP não detectado";
  const city = (await headersList).get("x-vercel-ip-city") ?? "Cidade não detectada";
  const country = (await headersList).get("x-vercel-ip-country") ?? "País não detectado";

  const res = await fetch(`${BACKEND_URL}/api/v1/contracts/sign/${id}`, {
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
      <SignContractView
        contract={contract}
        ipAddress={ip}
        location={{ city, country }}
      />
    </Suspense>
  );
}
