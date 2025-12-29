import { useSession } from "@/lib/auth-client";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { authedFetch } from "@/utils/authedFetch";

export type Notification = {
  id: string;
  userId: string;
  billId?: string;
  message: string;
  read: boolean;
  createdAt: string;
  bill?: { id: string; description: string; dueDate: string };
};

export function useNotifications(userId?: string) {
  const session = useSession();
  const { data, error, mutate, isLoading } = useSWR<Notification[]>(
    userId ? `/api/v1/tenancies/${session.data?.user.tenancyId}/notifications/${userId}` : null,
    fetcher,
    { refreshInterval: 30000 } // Atualiza a cada 30s
  );

  async function markAsRead(id: string) {
    await authedFetch(`/api/v1/tenancies/${session.data?.user.tenancyId}/notifications/${id}/read`, {
      method: "PATCH",
    });
    mutate();
  }

  async function remove(id: string) {
    await authedFetch(`/api/v1/tenancies/${session.data?.user.tenancyId}/notifications/${id}`, {
      method: "DELETE",
    });
    mutate();
  }

  return {
    notifications: data || [],
    isLoading,
    error,
    markAsRead,
    remove,
    mutate,
  };
}
