"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteStudents from "../delete";
import UpdateStudent from "../modals/UpdateStudent";
import { Tabs } from "@mantine/core";
import GeneralStudentsView from "./general";
import StudentHistoryView from "./history";
import StudentClassView from "./StudentClasses";
import StudentContractsView from "./StudentContracts";
import { useRouter, useSearchParams } from "next/navigation";
import StudentBillsView from "../(bills)/StudentBillsView";
import { StudentFromApi } from "../StudentFromApi";
import Sales from "../(sales)";
import { useSession } from "next-auth/react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";

export default function StudentsView({ id }: { id: string }) {
  const session = useSession();
  const tenancyId = session?.data?.user.tenancyId as string;

  const { data: student, error } = useSWR<StudentFromApi>(
    `/api/v1/tenancies/${tenancyId}/students/${id}`,
    fetcher
  );

  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudents([student?.id || ""], tenancyId);
      window.location.replace("/system/academic/students");
    } catch (error) {
      console.error("Falha ao excluir o estudante:", error);
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "general";

  const [tab, setTab] = useState(currentTab);

  if (error) {
    console.error("Falha ao carregar os dados do estudante:", error);
    return <div>Falha ao carregar os dados do estudante.</div>;
  }

  if (!student) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{`${student.firstName} ${student.lastName}`}</h1>
        <div className="flex gap-4 md:gap-6">
          <button
            className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setConfirmModalOpen(true)}
          >
            <FaTrash />
            <span>{"Excluir"}</span>
          </button>
          <button
            className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition"
            onClick={() => setOpenUpdate(true)}
          >
            <FaEdit />
            <span>{"Atualizar"}</span>
          </button>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={(value) => {
          setTab(value || ""); // muda aba localmente
          router.replace(
            `/system/academic/students/${student.id}?tab=${value}`,
            { scroll: false }
          );
        }}
        keepMounted={false}
        variant="pills"
        classNames={{
          tab: "!px-6 !py-4 !font-medium !rounded-2xl",
          root: "!p-1",
        }}
      >
        <Tabs.List justify="center">
          <Tabs.Tab value="general">Geral</Tabs.Tab>
          <Tabs.Tab value="payments">Pagamentos</Tabs.Tab>
          <Tabs.Tab value="sales">Vendas</Tabs.Tab>
          <Tabs.Tab value="classes">Turmas</Tabs.Tab>
          <Tabs.Tab value="contracts">Contratos</Tabs.Tab>
          <Tabs.Tab value="history">Histórico</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="general">
          <GeneralStudentsView student={student} />
        </Tabs.Panel>
        <Tabs.Panel value="payments">
          <StudentBillsView student={student} />
        </Tabs.Panel>
        <Tabs.Panel value="sales">
          <Sales student={student} />
        </Tabs.Panel>
        <Tabs.Panel value="classes">
          <StudentClassView student={student} />
        </Tabs.Panel>
        <Tabs.Panel value="contracts">
          <StudentContractsView student={student} />
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <StudentHistoryView {...student} />
        </Tabs.Panel>
      </Tabs>

      <UpdateStudent
        student={student}
        onClose={() => setOpenUpdate(false)}
        opened={openUpdate}
        mutate={() => window.location.reload() as any}
      />
      <ConfirmationModal
        opened={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        confirmLabel="Sim, Excluir"
        confirmColor="red"
        loading={isDeleting}
      >
        {`Tem certeza que deseja excluir o estudante ${
          student?.firstName || ""
        } ${student?.lastName || ""}?`}
      </ConfirmationModal>
    </div>
  );
}
