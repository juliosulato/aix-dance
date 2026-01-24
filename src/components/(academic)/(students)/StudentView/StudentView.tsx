"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import deleteStudents from "../delete";
import { Tabs } from "@mantine/core";
import GeneralStudentsView from "./general";
import StudentHistoryView from "./history";
import StudentClassView from "./StudentClasses";
import StudentContractsView from "./StudentContracts";
import { useRouter, useSearchParams } from "next/navigation";
import StudentBillsView from "../(bills)/StudentBillsView";
import Sales from "../(sales)";
import { useSession } from "@/lib/auth-client";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import StudentForm from "../../../../modules/academic/students/StudentForm/StudentForm";
import { StudentComplete } from "@/types/student.types";

export default function StudentsView({ id }: { id: string }) {
  const session = useSession();
  const tenantId = session?.data?.user.tenantId as string;

  const { data: student, error } = useSWR<{ data: StudentComplete, success: boolean }>(
    `/api/v1/tenants/${tenantId}/students/${id}`,
    fetcher
  );

  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudents([student?.data.id || ""], tenantId);
      window.location.replace("/system/academic/students");
    } catch (error) {
      console.error("Falha ao excluir o aluno:", error);
      setIsDeleting(false);
      setConfirmModalOpen(false);
    }
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "general";

  const [tab, setTab] = useState(currentTab);

  if (error) {
    console.error("Falha ao carregar os dados do aluno:", error);
    return <div>Falha ao carregar os dados do aluno.</div>;
  }

  if (!student) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
        <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{`${student.data.firstName} ${student.data.lastName}`}</h1>
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
          setTab(value || "");
          router.replace(
            `/system/academic/students/${student.data.id}?tab=${value}`,
            { scroll: false }
          );
        }}
        keepMounted={false}
        variant="pills"
        classNames={{
          tab: "!px-6 !py-4 font-medium! !rounded-2xl",
          root: "p-1!",
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
          <GeneralStudentsView student={student.data} />
        </Tabs.Panel>
        <Tabs.Panel value="payments">
          <StudentBillsView student={student.data} />
        </Tabs.Panel>
        <Tabs.Panel value="sales">
          <Sales student={student.data} />
        </Tabs.Panel>
        <Tabs.Panel value="classes">
          <StudentClassView student={student.data} />
        </Tabs.Panel>
        <Tabs.Panel value="contracts">
          <StudentContractsView student={student.data} />
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <StudentHistoryView {...student.data} />
        </Tabs.Panel>
      </Tabs>

      <StudentForm
        isEditing={student.data}
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
        {`Tem certeza que deseja excluir o aluno ${
          student.data?.firstName || ""
        } ${student.data?.lastName || ""}?`}
      </ConfirmationModal>
    </div>
  );
}
