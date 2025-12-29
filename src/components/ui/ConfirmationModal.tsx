"use client";

import { Modal, Button, Text, Group } from "@mantine/core";
import { TiWarningOutline } from "react-icons/ti";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
}

export default function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmColor = "red",
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title}
      size="md"
      radius="lg"
      centered
      classNames={{
        title: "!font-semibold",
        header: "!pb-2 !pt-4 !px-6 !mb-4 border-b border-b-neutral-300",
      }}

    >
      <Text size="sm">{children}</Text>
      <Group justify="flex-end" mt="xl">
        <Button
          radius="lg"
          size="md"
          className="text-sm! font-medium! tracking-wider w-full md:w-fit!"
          variant="default"
          onClick={onClose}
          disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          color={confirmColor}
          onClick={onConfirm}
          loading={loading}
          radius="lg"
          size="md"
          leftSection={<TiWarningOutline className="text-xl"/>}
          className="text-sm! font-medium! tracking-wider w-full md:w-fit!"
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
