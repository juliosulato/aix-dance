"use client";

import { Loader, Paper, Text } from "@mantine/core";

export default function LoadingSystem() {
  return (
    <main className="flex h-screen items-center justify-center bg-neutral-100 px-6">
      <Paper shadow="md" radius="lg" p="xl" className="flex items-center gap-4">
        <Loader color="violet" size="lg" type="oval" aria-label="Carregando" />
        <div className="flex flex-col">
          <Text fw={600} size="lg" className="text-neutral-800">
            Carregando módulo
          </Text>
          <Text size="sm" c="dimmed">
            Buscando dados do painel solicitado.
          </Text>
        </div>
      </Paper>
    </main>
  );
}
