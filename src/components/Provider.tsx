import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/utils/theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications className="z-2000!" />
        {children}
      </MantineProvider>
  );
}
