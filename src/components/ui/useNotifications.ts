import useSWR from "swr";

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
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR<Notification[]>(
    userId ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${process.env.NEXT_PUBLIC_TENANCY_ID}/notifications/${userId}` : null,
    fetcher,
    { refreshInterval: 30000 } // Atualiza a cada 30s
  );

  async function markAsRead(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${process.env.NEXT_PUBLIC_TENANCY_ID}/notifications/${id}/read`, { method: "PATCH" });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${process.env.NEXT_PUBLIC_TENANCY_ID}/notifications/${id}`, { method: "DELETE" });
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
