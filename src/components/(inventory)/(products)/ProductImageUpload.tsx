"use client";

import AvatarUpload from "@/components/avatarUpload";
import { notifications } from "@mantine/notifications";
import { useSession } from "@/lib/auth-client";

type Props = {
  productId: string;
  initialUrl?: string | null;
  onUpdated?: () => void; // e.g., SWR mutate
};

export default function ProductImageUpload({ productId, initialUrl, onUpdated }: Props) {
  const { data: sessionData, isPending } = useSession();

  const tenancyId = sessionData?.user?.tenancyId as string | undefined;

  const handleUploadComplete = async (url: string) => {
    if (!tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida" });
      return;
    }

    try {
      const res = await fetch(
        `/api/v1/tenancies/${tenancyId}/inventory/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Falha ao atualizar imagem do produto");
      }

      notifications.show({ color: "green", message: "Imagem do produto atualizada!" });
      onUpdated && onUpdated();
    } catch (err) {
      notifications.show({
        color: "red",
        message: `Erro ao salvar imagem: ${(err as Error).message}`,
      });
    }
  };

  if (isPending) return null;
  if (!sessionData) return <div>Sessão inválida</div>; return null;

  return (
    <AvatarUpload
      defaultUrl={initialUrl ?? null}
      onUploadComplete={handleUploadComplete}
      folder="inventory/products"
    />
  );
}
