"use client";
import { Button, ActionIcon } from "@mantine/core";
import { FaTrash, FaPencilAlt, FaEye } from "react-icons/fa";
import ConfirmationModal from "../ui/ConfirmationModal";
import { notifications } from "@mantine/notifications";
import NewClassAttendance from "./newClassAttendance";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Breadcrumps from "../ui/Breadcrumps";
import { useSession } from "@/lib/auth-client";
import { ClassWithTeacher } from "@/types/class.types";

dayjs.extend(utc);
dayjs.extend(timezone);


export default function ClassDetails({ classId }: { classId: string }) {
    const [isOpened, setIsOpened] = useState(false);
    const [attendanceToEdit, setAttendanceToEdit] = useState(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const session = useSession().data;

    const { data: classData, isLoading, mutate } = useSWR<ClassWithTeacher>(`/api/v1/tenants/${session?.user.tenantId}/classes/${classId}`, fetcher);

    if (isLoading || !classData) {
        return <p>Carregando... </p>;
    }

    const handleEdit = (attendance: any) => {
        setAttendanceToEdit(attendance);
        setIsOpened(true);
    };

    const handleAdd = () => {
        setAttendanceToEdit(null);
        setIsOpened(true);
    };

    const handleClose = () => {
        setIsOpened(false);
        setAttendanceToEdit(null);
            mutate();
    };

    const userRole = session?.user?.role;

    // Função para deletar chamada
    const handleDelete = (attendanceId: string) => {
        if (userRole !== "ADMIN" && userRole !== "STAFF") {
            notifications.show({
                title: "Acesso restrito",
                message: "Somente a gestão da academia pode deletar uma lista de chamada.",
                color: "yellow",
            });
            return;
        }
        setDeleteModal({ open: true, id: attendanceId });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${session?.user.tenantId}/class-attendances/${deleteModal.id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erro ao deletar");
            notifications.show({
                title: "Sucesso",
                message: "Lista de chamada deletada com sucesso!",
                color: "green",
            });
            // Aqui você pode revalidar o SWR ou forçar um refresh
        } catch (e) {
            console.error(e);
            notifications.show({
                title: "Erro",
                message: "Não foi possível deletar a lista de chamada.",
                color: "red",
            });
        } finally {
            setDeleteLoading(false);
            mutate();
            setDeleteModal({ open: false, id: null });
        }
    };

    if (!session) {
        return <p>Você precisa estar autenticado para acessar esta página.</p>;
    }

    return (
        <>
            <Breadcrumps
                items={[
                    "Minhas Turmas",

                ]}
                menu={[{
                    label: "Minhas Turmas", href: "/system/teachers/classes",
                },
               
                {
                    label: classData.name, href: `/system/teachers/classes/${classId}`
                }]}
            />
            <section>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="font-bold text-2xl">Lista de Chamada</h2>
                    <Button onClick={handleAdd}>Adicionar Lista de Chamada</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8">
                    {classData?.classAttendances?.map((attendance: any) => (
                        <div className="bg-white p-4 2xl:p-6 rounded-2xl shadow flex flex-col gap-2" key={attendance.id}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold">
                                    <strong>Data:</strong> {dayjs(attendance.date).tz("America/Sao_Paulo").format("DD/MM/YYYY")}
                                </p>
                                <div className="flex gap-2">
                                    <ActionIcon
                                        variant="light"
                                        color="blue"
                                        onClick={() => {
                                            handleEdit(attendance);
                                        }}
                                        title="Editar chamada"
                                    >
                                        <FaPencilAlt size={15} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="light"
                                        color="red"
                                        onClick={() => handleDelete(attendance.id)}
                                        title="Deletar chamada"
                                        disabled={userRole !== "ADMIN" && userRole !== "STAFF"}
                                        style={{ opacity: userRole === "ADMIN" || userRole === "STAFF" ? 1 : 0.5, cursor: userRole === "ADMIN" || userRole === "STAFF" ? "pointer" : "not-allowed" }}
                                    >
                                        <FaTrash size={15} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="light"
                                        color="gray"
                                        onClick={() => window.location.replace(`/system/teachers/classes/${classId}/attendances/${attendance.id}`)}
                                        title="Ver chamada"
                                    >
                                        <FaEye size={15} />
                                    </ActionIcon>
                                </div>
                            </div>
                            {attendance.isSubstitute && <p><em>Aula de substituição: {attendance.teacher.firstName + " " + attendance.teacher.lastName}</em></p>}
                        </div>
                    ))}
                </div>
                {classData && (
                    <NewClassAttendance
                        teacherId={session.user.id}
                        studentsClass={classData}
                        opened={isOpened}
                        onClose={handleClose}
                        attendanceToEdit={attendanceToEdit}
                    />
                )}
                <ConfirmationModal
                    opened={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, id: null })}
                    onConfirm={confirmDelete}
                    title="Confirmar exclusão"
                    confirmLabel="Deletar"
                    confirmColor="red"
                    loading={deleteLoading}
                >
                    Tem certeza que deseja deletar esta lista de chamada? Essa ação não pode ser desfeita.
                </ConfirmationModal>
            </section>

        </>
    );
}