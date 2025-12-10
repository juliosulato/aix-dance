"use client";

import { StudentContract, Tenancy, ContractSignatureLog } from '@prisma/client';
import { Paper, Text, Divider, Center, Alert, Table, Badge, Title, Group, Button } from '@mantine/core';
import { FaFileContract, FaUserCheck, FaMapMarkerAlt, FaPrint, FaCalendarCheck } from 'react-icons/fa';
import SafeHtml from '@/components/ui/SafeHtml';

interface ContractWithAudit extends StudentContract {
    student: {
        firstName: string;
        lastName: string;
        tenancy: Tenancy;
    };
    signatureLogs: ContractSignatureLog[];
}

type Props = {
    contract: ContractWithAudit;
};

export default function ContractAuditView({ contract }: Props) {
    
    // Função para acionar a impressão do navegador
    const handlePrint = () => {
        window.print();
    };

    if (!contract?.student || !contract?.student.tenancy?.name) {
        return (
            <Center style={{ height: '100vh', padding: '2rem' }}>
                <Alert color="red" title="Erro ao Carregar Contrato">
                    Não foi possível carregar todas as informações do contrato.
                </Alert>
            </Center>
        );
    }
    
    return (
        <>
            {/* CSS específico para impressão: esconde tudo, exceto o contrato */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-contract, #printable-contract * {
                        visibility: visible;
                    }
                    #printable-contract {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20mm; /* Margens de impressão */
                        font-size: 12pt;
                        color: black;
                    }
                    /* SOLUÇÃO: Estilos para "limpar" o contentor do contrato na impressão */
                    #printable-contract > div {
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        background-color: white !important; /* Garante fundo branco */
                        max-height: none !important;
                        overflow: visible !important;
                        box-shadow: none !important;
                    }
                    .print-button {
                        display: none;
                    }
                }
            `}</style>

            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Paper shadow="lg" p="xl" radius="lg" withBorder className="max-w-4xl w-full">
                    
                    <div className="text-center mb-6">
                        <FaFileContract className="mx-auto text-4xl text-primary mb-2" />
                        <Title order={1} className="text-2xl font-bold text-gray-800">Visualização de Contrato</Title>
                        <Text c="dimmed">
                            Contrato entre <strong>{contract.student.firstName} {contract.student.lastName}</strong> e <strong>{contract.student.tenancy.name}</strong>
                        </Text>
                    </div>

                    {/* Botão de impressão adicionado */}
                    <Group justify="flex-end" mb="md" className="print-button">
                        <Button onClick={handlePrint} leftSection={<FaPrint size={16}/>} variant="light">
                            Imprimir Contrato
                        </Button>
                    </Group>
                    
                    {/* O ID está no contentor pai */}
                    <div id="printable-contract">
                         {/* Este é o contentor que recebe os estilos da tela (borda, etc.) */}
                        <SafeHtml
                            html={contract.htmlContent}
                            className="prose max-w-none p-4 border rounded-lg bg-gray-50 mb-6 max-h-[50vh] overflow-y-auto"
                        />
                    </div>


                    <Divider my="xl" label="Rasto de Auditoria da Assinatura" labelPosition="center" className="print-button" />

                    {contract.signatureLogs && contract.signatureLogs.length > 0 ? (
                        <div className="print-button">
                            <Table striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Assinante</Table.Th>
                                        <Table.Th>Data e Hora</Table.Th>
                                        <Table.Th>Endereço IP</Table.Th>
                                        <Table.Th>Localização</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {contract.signatureLogs.map((log) => (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>
                                                <Group>
                                                    <FaUserCheck />
                                                    <div>
                                                        <Text fw={500}>{log.fullName}</Text>
                                                        <Text size="xs" c="dimmed">{log.document}</Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group>
                                                    <FaCalendarCheck />
                                                    <Text>{new Date(log.signedAt).toLocaleString('pt-BR')}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light">{log.ipAddress}</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group>
                                                    <FaMapMarkerAlt />
                                                    <Text>{log.location || 'Não disponível'}</Text>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </div>
                    ) : (
                        <Alert color="blue" title="Pendente de Assinatura" className="print-button">
                            Este contrato ainda não foi assinado. Nenhuma informação de auditoria está disponível.
                        </Alert>
                    )}
                    {document.referrer.startsWith (window.location.origin) && (
                        <Group justify="flex-end" mt="md" className="print-button">
                            <Button onClick={() => window.history.back()}>
                                Voltar
                            </Button>
                        </Group>
                    )}

                </Paper>
            </main>
        </>
    );
}

