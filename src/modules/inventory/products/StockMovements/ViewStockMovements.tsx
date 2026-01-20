import {
  ActionIcon,
  Button,
  Group,
  Table,
  Tooltip,
} from "@mantine/core";
import CreateStockMovement from "./CreateStockMovement";
import dayjs from "dayjs";
import { FaRegTrashAlt } from "react-icons/fa";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { StockMovement } from "@/types/inventory.types";
import { useCrud } from "@/hooks/useCrud";
import { ProductWithStockMovement } from "@/types/product.types";
import { SessionData } from "@/lib/auth-server";

export default function ViewStockMovements({
  product,
  user
}: {
  product: ProductWithStockMovement;
  user: SessionData["user"];
}) {
  const crud = useCrud<StockMovement>({});

  const movements = product.stockMovements;

  return (
    <>
      <div>
        <Group justify="space-between" align="center" mb="md">
          <h2  className="text-2xl font-bold">Movimentos de Estoque</h2>
          <Button
            onClick={crud.handleCreate}
            color="#7439FA"
            radius="lg"
            size="lg"
            fullWidth={false}
            className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
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
                          onClick={() => crud.handleDelete(movement)}
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
        opened={crud.modals.delete}
        onClose={crud.closeModals.delete}
        onConfirm={crud.confirmDelete}
        title={"Confirmar Exclusão"}
        confirmLabel={"Excluir"}
        cancelLabel={"Cancelar"}
        loading={crud.isDeleting}
      >
        {"Tem certeza que deseja excluir este movimento de estoque?"}
        <br />
        <span style={{ color: "#fa5252", fontSize: 12, fontWeight: 600 }}>
          {"Essa ação não pode ser desfeita."}
        </span>
      </ConfirmationModal>
      
      <CreateStockMovement
        opened={crud.modals.create}
        onClose={crud.closeModals.create}
        productId={product.id}
      />
    </>
  );
}
