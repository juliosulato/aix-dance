"use client";

import { useSession } from "@/lib/auth-client";
import DataView from "@/components/ui/DataView";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "dayjs/locale/es";
import "dayjs/locale/en";
import { ActionIcon, Badge, Menu, Text } from "@mantine/core";
import { useState } from "react";
import NewStudentContract from "../(contracts)/new";
import { FaCheck, FaCopy, FaEllipsisV } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteStudentContracts from "./deleteStudentContracts";
import archiveStudentContracts from "./archiveStudentContracts";
import { ContractStatus } from "@/types/contracts.types";
import { StudentComplete } from "@/types/student.types";

// Tipagem para o item do contrato, assumindo que a API retorna o título do modelo
type ContractItem = StudentComplete["contracts"][0] & { title?: string };

export default function StudentContractsView({ student }: { student: StudentComplete }) {

  const [openNew, setOpenNew] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [contractToAction, setContractToAction] = useState<ContractItem | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'archive' | null>(null);
  const [isActing, setIsActing] = useState(false);

  const { data: sessionData } = useSession();

  
  const tenancyId = sessionData?.user.tenancyId || "";

  const handleCopyLink = (contractId: string) => {
    const link = `https://aixdance.mazzaux.com.br/pt-BR/contracts/sign/${contractId}`;
    navigator.clipboard.writeText(link);
    notifications.show({
      title: "Link Copiado!",
      message: "O link de assinatura foi copiado para a área de transferência.",
      color: 'green',
      icon: <FaCheck />,
    });
  };

  // const handleDeleteClick = (contract: ContractItem) => {
  //   setContractToAction(contract);
  //   setActionType('delete');
  //   setConfirmModalOpen(true);
  // };

  // const handleArchiveClick = (contract: ContractItem) => {
  //   setContractToAction(contract);
  //   setActionType('archive');
  //   setConfirmModalOpen(true);
  // };

  const handleConfirmAction = async () => {
    if (!contractToAction || !actionType) return;
    setIsActing(true);
    try {
      if (actionType === 'delete') {
        await deleteStudentContracts([contractToAction.id], tenancyId);
      } else if (actionType === 'archive') {
        await archiveStudentContracts([contractToAction.id], tenancyId);
      }
      window.location.reload(); // Recarrega para ver as alterações
    } catch (error) {
      console.error(`Falha ao ${actionType} o contrato:`, error);
    } finally {
      setIsActing(false);
      setConfirmModalOpen(false);
      setContractToAction(null);
    }
  };

  const renderStatusBadge = (status: ContractStatus) => {
    const statuses = {
      PENDING: { label: "Pendente", color: "yellow" },
      SENT: { label: "Enviado", color: "blue" },
      SIGNED: { label: "Assinado", color: "green" },
      CANCELED: { label: "Cancelado", color: "red" },
    };
    const { label, color } = statuses[status] || { label: status, color: "gray" };
    return <Badge color={color} variant="light">{label}</Badge>;
  };

  const MenuItem = ({ item }: { item: ContractItem }) => (
    <Menu shadow="md" width={200} withinPortal position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="transparent" color="gray"><FaEllipsisV /></ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Ações</Menu.Label>
        {item.status !== 'SIGNED' && (
          <Menu.Item leftSection={<FaCopy size={14} />} onClick={() => handleCopyLink(item.id)}>
            Copiar Link de Assinatura
          </Menu.Item>
        )}

      </Menu.Dropdown>
    </Menu>
  );

  return (
    <div className="bg-neutral-100 p-4 md:p-6 lg:p-8 rounded-2xl border-neutral-200 border mt-4 md:mt-6">
      <DataView<ContractItem>
        pageTitle="Contratos do Aluno"
        data={student.contracts || []}
        baseUrl="/pt-BR/contracts/views/"
        openNewModal={{ label: "Gerar Novo Contrato", func: () => setOpenNew(true) }}
        searchbarPlaceholder={"Pesquisar por título do contrato..."}
        columns={[
          { key: "title" as any, label: "Título do Contrato", render: (value, item) => item?.title || 'Contrato Personalizado' },
          { key: "createdAt", label: "Criado Em", render: (value) => dayjs(value).format("DD/MM/YYYY") },
          { key: "signedAt", label: "Assinado Em", render: (value) => value ? dayjs(value).format("DD/MM/YYYY") : '-' },
          { key: "status", label: "Status", render: (status) => renderStatusBadge(status) },
        ]}
        RenderRowMenu={(item) => <MenuItem item={item} />}
        renderCard={(item) => (
          <>
            <div className="flex justify-between items-start">
              <Text fw={500} size="lg">{item.title || 'Contrato Personalizado'}</Text>
              <MenuItem item={item} />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {renderStatusBadge(item.status)}
              <Text size="sm"><strong>Criado em:</strong> {dayjs(item.createdAt).format("DD/MM/YYYY")}</Text>
              {item.signedAt && <Text size="sm"><strong>Assinado em:</strong> {dayjs(item.signedAt).format("DD/MM/YYYY")}</Text>}
            </div>
          </>
        )}
      />

      <NewStudentContract studentId={student.id} opened={openNew} mutate={() => window.location.reload()} onClose={() => setOpenNew(false)} />

      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={`Confirmar ${actionType === 'delete' ? 'Exclusão' : 'Arquivamento'}`}
        confirmLabel={actionType === 'delete' ? 'Sim, Excluir' : 'Sim, Arquivar'}
        loading={isActing}
      >
        <Text>
          Você tem certeza que deseja {actionType === 'delete' ? 'excluir' : 'arquivar'} o contrato &quot;{contractToAction?.title || 'Contrato Personalizado'}&quot;?
        </Text>
        {actionType === 'delete' && <Text c="red" size="sm" fw={500} mt="md">Esta ação é permanente.</Text>}
      </ConfirmationModal>
    </div>
  );
}
