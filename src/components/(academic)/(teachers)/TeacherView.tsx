"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Gender, RemunerationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { TeacherFromApi } from "./modals/UpdateTeacher"; // Supondo que o tipo esteja aqui
import UpdateTeacher from "./modals/UpdateTeacher";
import deactivateUsers from "./delete"; // Supondo que a função de delete agora desative usuários
import dayjs from "dayjs";
import UpdateTeacherAccessData from "./modals/accessDataUpdate";

// --- Funções Auxiliares para Formatação ---

const formatGender = (gender: Gender, t: (key: string) => string) => {
    const key = `forms.general-fields.gender.options.${gender}`;
    return t(key);
}

const formatRemunerationType = (type: RemunerationType, t: (key: string) => string) => {
    const key = `academic.teachers.modals.create.remuneration.fields.contractType.options.${type}`;
    return t(key);
}

const formatBoolean = (value: boolean | null | undefined, t: (key: string) => string) => {
    if (value === true) return "Texto";
    if (value === false) return "Texto";
    return "-";
}

export default function TeacherView({ teacher, tenancyId }: { teacher: TeacherFromApi, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [openUpdateAccessData, setOpenUpdateAccessData] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deactivateUsers([teacher.id], tenancyId);
            router.push("/system/academic/teachers");
            router.refresh();
        } catch (error) {
            console.error("Falha ao desativar o professor:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    // Extraindo sub-objetos para facilitar o acesso e evitar erros
    const teacherData = teacher.teacher;
    const addressData = teacher.teacher?.address;

    return (
        <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm lg:p-8 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col items-center justify-center md:justify-between gap-4 md:flex-row md:flex-wrap mb-4">
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{"Professor"}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{"Excluir"}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{"Atualizar"}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdateAccessData(true)}>
                        <FaEdit />
                        <span>{"Editar"}</span>
                    </button>
                </div>
            </div>

            {/* Seção de Informações Pessoais */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{"Informações Pessoais"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Primeiro Nome"} children={teacher.firstName} />
                <InfoTerm label={"Sobrenome"} children={teacher.lastName} />
                <InfoTerm label={"E-mail"} children={teacher.email} />
                <InfoTerm label={"Data de Nascimento"} children={teacherData?.dateOfBirth ? dayjs(teacherData.dateOfBirth).format("DD/MM/YYYY") : "-"} />
                <InfoTerm label={"CPF"} children={teacherData?.document || "-"} />
                <InfoTerm label={"Gênero"} children={teacherData?.gender || "-"} />
                <InfoTerm label={"Pronome"} children={teacherData?.pronoun || "-"} />
                <InfoTerm label={"Instagram"} children={teacherData?.instagramUser || "-"} />
                <InfoTerm label={"Registro Profissional"} children={teacherData?.professionalRegister || "-"} />
            </div>

             {/* Seção de Endereço */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Endereço"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Logradouro"} children={addressData?.publicPlace || "-"} />
                <InfoTerm label={"Número"} children={addressData?.number || "-"} />
                <InfoTerm label={"Complemento"} children={addressData?.complement || "-"} />
                <InfoTerm label={"Bairro"} children={addressData?.neighborhood || "-"} />
                <InfoTerm label={"Cidade"} children={addressData?.city || "-"} />
                <InfoTerm label={"Estado"} children={addressData?.state || "-"} />
                <InfoTerm label={"CEP"} children={addressData?.zipCode || "-"} />
            </div>

            {/* Seção de Remuneração */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Remuneração"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Tipo de Remuneração"} children={teacherData?.remunerationType || "-"} />
                <InfoTerm label={teacherData?.remunerationType == "HOURLY" ? "Valor por Hora" : "Salário Base"} children={`R$ ${Number(teacherData?.baseAmount || 0).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={"Dia do Pagamento"} children={`${teacherData?.paymentDay || "-"}`} />
                <InfoTerm label={"Bônus por Presença"} children={`R$ ${Number(teacherData?.bonusForPresenceAmount ?? 0).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={"Perde Bônus quando Ausente"} children={teacherData?.loseBonusWhenAbsent ? "Sim" : "Não"} />
            </div>

             {/* Seção de Comissões */}
             {teacherData?.comissionTiers && teacherData.comissionTiers.length > 0 && (
                 <>
                    <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Comissões"}</h2>
                    <div className="grid gap-4 md:grid-cols-1">
                        {teacherData.comissionTiers.map((tier, index) => (
                           <div key={index} className="grid grid-cols-3 gap-4 p-2 border-b">
                               <InfoTerm label={"Mínimo de Alunos"} children={`${tier.minStudents} alunos`} />
                               <InfoTerm label={"Máximo de Alunos"} children={`${tier.maxStudents} alunos`} />
                               <InfoTerm label={"Comissão"} children={`R$ ${Number(tier.comission).toFixed(2).replace(/\./g, ",")}`} />
                           </div>
                        ))}
                    </div>
                </>
             )}


            {/* Modais de Ação */}
            <UpdateTeacher user={teacher} onClose={() => setOpenUpdate(false)} opened={openUpdate} mutate={() => window.location.reload() as any} />
            <UpdateTeacherAccessData user={teacher} onClose={() => setOpenUpdateAccessData(false)} opened={openUpdateAccessData} mutate={() => window.location.reload() as any} />
            <ConfirmationModal
                opened={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={"Desativar Professor"}
                confirmLabel={"Desativar"}
                cancelLabel={"Cancelar"}
                confirmColor="red"
                loading={isDeleting}
            >
                {`Tem certeza de que deseja desativar o professor ${teacher?.firstName + " " + teacher?.lastName || ""}?`}
            </ConfirmationModal>
        </div>
    );
}
