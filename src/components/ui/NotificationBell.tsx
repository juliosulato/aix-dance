
import { ActionIcon, Badge, Box, Group, HoverCard, Loader, Stack, Text } from "@mantine/core";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useNotifications } from "./useNotifications";
import dayjs from "dayjs";

export default function NotificationBell() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { notifications, isLoading, markAsRead, remove } = useNotifications(userId);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <HoverCard width={350} shadow="md" position="bottom-end" withinPortal>
      <HoverCard.Target>
        <ActionIcon size="42px" variant="light" color="gray">
          {unreadCount > 0 ? (
            <Badge color="red" size="sm" style={{ position: "absolute", top: 0, right: 0 }}>{unreadCount}</Badge>
          ) : null}
          <IoNotificationsOutline className="text-2xl" />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Box p="xs">
          <Text fw={500} mb="xs">Notificações</Text>
          {isLoading ? <Loader size="sm" /> : null}
          <Stack gap="xs">
            {notifications.length === 0 && !isLoading && (
              <Text size="sm" c="dimmed">Nenhuma notificação</Text>
            )}
            {notifications.map(n => (
              <Box key={n.id} style={{ background: n.read ? "#f8f9fa" : "#fffbe6", padding: 8, borderRadius: 8 }}>
                <Group justify="space-between" align="center">
                  <Box onClick={() => !n.read && markAsRead(n.id)} style={{ cursor: n.read ? "default" : "pointer" }}>
                    <Text size="sm" fw={n.read ? 400 : 600}>{n.message}</Text>
                    {n.bill && (
                      <Text size="xs" c="dimmed">
                        {n.bill.description} - Venc: {dayjs(n.bill.dueDate).format("DD/MM/YYYY")}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed">{dayjs(n.createdAt).format("DD/MM/YYYY")}</Text>
                  </Box>
                  <ActionIcon color="red" variant="subtle" onClick={() => remove(n.id)}>
                    <MdDelete />
                  </ActionIcon>
                </Group>
              </Box>
            ))}
          </Stack>
        </Box>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
