import { notFound } from "next/navigation";
import SignContractView from "./SignContractView";
import { StudentContract } from "@prisma/client";
import { Suspense } from "react";
import { Loader, Center } from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers"; // Importamos a função 'headers' do Next.js

// A interface para os dados continua a mesma
interface ContractWithRelations extends StudentContract {
    student: {
        firstName: string;
        lastName: string;
        tenancy: {
            name: string;
        }
    };
}

export default async function SignContractPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // SOLUÇÃO: Capturamos os cabeçalhos da requisição no lado do servidor
    const headersList = headers();
    const ip = (await headersList).get("x-forwarded-for") ?? "IP não detectado";
    const city = (await headersList).get("x-vercel-ip-city") ?? "Cidade não detectada";
    const country = (await headersList).get("x-vercel-ip-country") ?? "País não detectado";


    const contract = await prisma.studentContract.findUnique({
        where: { id },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    tenancy:true
                }
            },
        }
    });

    if (!contract) {
        notFound();
    }

    return (
        <Suspense fallback={<Center style={{ height: '100vh' }}><Loader /></Center>}>
            <SignContractView
                contract={contract}
                ipAddress={ip}
                location={{ city, country }}
            />
        </Suspense>
    );
}

