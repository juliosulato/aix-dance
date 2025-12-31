"use client";

import { SWRConfig } from "swr";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/utils/theme";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const notification = params.get("notification");

  useEffect(() => {
    switch (notification) {
      case "create-success":
        Notifications.show({
          message: "Item criado com sucesso!",
          color: "green",
        });
        break;
      case "update-success":
        Notifications.show({
          message: "Item atualizado com sucesso!",
          color: "green",
        });
        break;
      case "delete-success":
        Notifications.show({
          message: "Item(s) excluído(s) com sucesso!",
          color: "green",
        });
        break;
      case "error":
        Notifications.show({
          message: "Ocorreu um erro ao processar sua solicitação.",
          color: "red",
        });
        break;
      case "not-authenticated":
        Notifications.show({
          message: "Você precisa estar autenticado para acessar esta página.",
          color: "red",
        });
        break;
      default:
        break;
    }
  }, [notification]);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications className="z-2000!" />
        {children}
      </MantineProvider>
    </SWRConfig>
  );
}
