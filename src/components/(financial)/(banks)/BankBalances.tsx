import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Card, Group, Stack, Text, Title } from "@mantine/core";

// Tipos esperados do backend
interface BankBalance {
  bankId: string;
  name: string;
  saldo: number;
  entradas: number;
  saidas: number;
}

export function BankBalances() {
  const { data: sessionData } = useSession();
  const { data, error, isLoading } = useSWR<BankBalance[]>(
    sessionData?.user.tenancyId
      ? `/api/v1/tenancies/${sessionData.user.tenancyId}/banks/balances`
      : null,
    fetcher
  );

  if (isLoading) return <Text>Carregando saldos...</Text>;
  if (error) return <Text style={{ color: 'var(--mantine-color-red-6)' }}>Erro ao carregar saldos bancários.</Text>;
  if (!data || data.length === 0) return <Text>Nenhum banco encontrado.</Text>;

  return (
    <Stack>
      <Title order={4}>Saldo por Banco</Title>
      {data.map((bank) => (
        <Card key={bank.bankId} shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={600}>{bank.name}</Text>
            <Text style={{ color: bank.saldo >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)' }}>
              Saldo: R$ {bank.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </Group>
          <Group gap="md">
            <Text size="sm" style={{ color: 'var(--mantine-color-green-6)' }}>Entradas: R$ {bank.entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
            <Text size="sm" style={{ color: 'var(--mantine-color-red-6)' }}>Saídas: R$ {bank.saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
