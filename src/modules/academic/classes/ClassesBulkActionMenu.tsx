import { Button, Group } from "@mantine/core";
import { MdDelete } from "react-icons/md";

type BulkActionMenuProps = {
  selectedIds: string[];
  onBulkDelete: (ids: string[]) => void;
};

export function BulkActionMenu({
  selectedIds,
  onBulkDelete,
}: BulkActionMenuProps) {
  return (
    <Group gap="sm">
      <Button
        leftSection={<MdDelete size={16} />}
        color="red"
        variant="light"
        onClick={() => onBulkDelete(selectedIds)}
        disabled={selectedIds.length === 0}
      >
        Excluir Selecionadas ({selectedIds.length})
      </Button>
    </Group>
  );
}
