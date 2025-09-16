import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader, Center } from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { StudentContract } from "@prisma/client";
import ContractAuditView from "./ContractAuditView";

// Tipagem para incluir todas as relações necessárias
interface ContractWithAudit extends StudentContract {
    student: {
        firstName: string;
        lastName: string;
        tenancy: {
            name: string;
        }
    };
    signatureLogs: {
        id: string;
        fullName: string;
        document: string;
        signedAt: Date;
        ipAddress: string;
        location: string | null;
        userAgent: string;
    }[];
}

export default async function ViewContractPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const contract = await prisma.studentContract.findUnique({
        where: { id },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    tenancy: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            // Incluímos os registos de assinatura na consulta
            signatureLogs: true,
        }
    });

    if (!contract) {
        notFound();
    }


    return (
        <Suspense fallback={<Center style={{ height: '100vh' }}><Loader /></Center>}>
            <ContractAuditView contract={contract as any} />
        </Suspense>
    );
}
