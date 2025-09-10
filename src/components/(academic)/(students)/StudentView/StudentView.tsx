"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
import deleteStudents from "../delete";
import UpdateStudent from "../modals/UpdateStudent";
import { StudentFromApi } from "../modals/NewStudent";
import { Tabs } from "@mantine/core";
import GeneralStudentsView from "./general";

export default function StudentsView({ student, tenancyId }: { student: StudentFromApi, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteStudents([student.id], tenancyId, t);
            window.location.replace("/system/academic/students");
        } catch (error) {
            console.error("Falha ao excluir o estudante:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    const t = useTranslations();

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("academic.students.view.title")}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{t("general.actions.delete")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{t("general.actions.update")}</span>
                    </button>
                </div>
            </div>


            <Tabs
                keepMounted={false}
                defaultValue="general"
                variant="pills"
                classNames={{ tab: "!px-6 !py-4 !font-medium !rounded-2xl", root: "!p-1" }}
            >
                <Tabs.List justify="center">
                    <Tabs.Tab value="general">Geral</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="general">
                    <GeneralStudentsView student={student} />
                </Tabs.Panel>
            </Tabs>


            <UpdateStudent student={student} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                confirmLabel="Sim, Excluir"
                confirmColor="red"
                loading={isDeleting}
            >
                {t("academic.students.modals.confirmModal.text", {
                    student: student?.firstName + " " + student?.lastName || ""
                })}
            </ConfirmationModal>
        </div>
    );
}