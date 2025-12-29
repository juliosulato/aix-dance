import { fetcher } from "@/utils/fetcher";
import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Table,
  Tooltip,
} from "@mantine/core";
import { useSession } from "@/lib/auth-client";
import useSWR from "swr";
import CreateStockMovement from "./CreateStockMovement";
import { useState } from "react";
import dayjs from "dayjs";
import { FaRegTrashAlt } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { StockMovementWithCreator } from "@/types/inventory.types";

export default function ViewStockMovements({
  productId,
  productMutate
}: {
  productId: string;
  productMutate: () => void;
}) {
  const { data: sessionData, status } = useSession();
  const { data, error, mutate } = useSWR<any>(
    `/api/v1/tenancies/${sessionData?.user.tenancyId}/inventory/stock-movements?productId=${productId}`,
    fetcher
  );

  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [movementIdToDelete, setMovementIdToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (error) return <div>Falha ao carregar os movimentos de estoque.</div>;

  if (!data || status === "loading") {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={9999}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "violet", type: "dots" }}
        pos="fixed"
        h="100vh"
        w="100vw"
      />
    );
  }

  if (status !== "authenticated") return <div>Sessão inválida</div>;

  // Normalize API shape: it may return an array or an object { movements, pagination }
  const movements: StockMovementWithCreator[] = Array.isArray(data)
    ? (data as StockMovementWithCreator[])
    : (data?.movements as StockMovementWithCreator[]) || [];

  const handleDelete = async (movementId: string) => {
    try {
      const res = await fetch(
        `/api/v1/tenancies/${sessionData?.user.tenancyId}/inventory/stock-movements/${movementId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Falha ao excluir movimento");
      }
      notifications.show({
        color: "green",
        message: "Movimento excluído com sucesso.",
      });
      mutate();
    } catch (err) {
      notifications.show({
        color: "red",
        message: `Erro ao excluir: ${(err as Error).message}`,
      });
    } finally{
      productMutate();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!movementIdToDelete) {
      setConfirmModalOpen(false);
      return;
    }
    setIsDeleting(true);
    await handleDelete(movementIdToDelete);
    setIsDeleting(false);
    setConfirmModalOpen(false);
    setMovementIdToDelete(null);
  };

  return (
    <>
      <div>
        <Group justify="space-between" align="center" mb="md">
          <h2  className="text-2xl font-bold">Movimentos de Estoque</h2>
          <Button
            onClick={() => setCreateModalOpened(true)}
            color="#7439FA"
            radius="lg"
            size="lg"
            fullWidth={false}
            className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
          >
            Lançar Movimento
          </Button>
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Data</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Quantidade</Table.Th>
              <Table.Th>Responsável</Table.Th>
              <Table.Th>Observações</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {movements &&
              movements.length > 0 &&
              movements
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((movement) => (
                  <Table.Tr key={movement.id}>
                    <Table.Td>
                      {dayjs(movement.createdAt).format("DD/MM/YYYY HH[h]mm")}
                    </Table.Td>
                    <Table.Td>
                      {movement.type === "IN"
                        ? "Entrada"
                        : movement.type === "OUT"
                        ? "Saída"
                        : "Balanço"}
                    </Table.Td>
                    <Table.Td>{movement.quantity}</Table.Td>
                    <Table.Td>{movement.createdBy?.firstName + " " + movement.createdBy?.lastName || "-"}</Table.Td>
                    <Table.Td>{movement.reason || "-"}</Table.Td>
                    <Table.Td>
                      <Tooltip label="Excluir movimento" color="red">
                        <ActionIcon
                          variant="light"
                          color="gray"
                          classNames={{
                            root: "hover:!bg-red-100 transition",
                            icon: "hover:!text-red-600 transition",
                          }}
                          title="Excluir movimento"
                          onClick={() => {
                            setMovementIdToDelete(movement.id);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <FaRegTrashAlt />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
          </Table.Tbody>
        </Table>
      </div>
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={isDeleting}
      >
        {"Tem certeza que deseja excluir este movimento de estoque?"}
        <br />
        <span style={{ color: "#fa5252", fontSize: 12, fontWeight: 600 }}>
          {"Essa ação não pode ser desfeita."}
        </span>
      </ConfirmationModal>
      <CreateStockMovement
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        productId={productId}
        mutates={() => {
          mutate();
          productMutate();
        }}
      />
    </>
  );
}
