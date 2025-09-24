"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useRouter } from "next/navigation";
import { TeacherFromApi } from "./modals/UpdateTeacher"; // Supondo que o tipo esteja aqui
import UpdateTeacher from "./modals/UpdateTeacher";
import deactivateUsers from "./delete"; // Supondo que a função de delete agora desative usuários
import dayjs from "dayjs";
import UpdateTeacherAccessData from "./modals/accessDataUpdate";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { Gender } from "@prisma/client";


export default function TeacherView({ id }: { id: string }) {
        const session = useSession();
        
        const tenancyId = session?.data?.user.tenancyId as string;

        const { data: teacher, error } = useSWR<TeacherFromApi>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${tenancyId}/users/${id}`,
            fetcher
        );
        
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [openUpdateAccessData, setOpenUpdateAccessData] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deactivateUsers([teacher?.id || "-"], tenancyId);
            router.push("/system/academic/teachers");
            router.refresh();
        } catch (error) {
            console.error("Falha ao desativar o professor:", error);
            setIsDeleting(false);
            setConfirmModalOpen(false);
        }
    };

    // Extraindo sub-objetos para facilitar o acesso e evitar erros
    const teacherData = teacher?.teacher;
    const addressData = teacher?.teacher?.address;

    if (error) {
        console.error("Falha ao carregar os dados do professor:", error);
        return <div>Falha ao carregar os dados do professor.</div>;
    }
    
    if (!teacher) {
        return <div>Carregando...</div>;
    }

    function renderGender(gender: Gender) {
        switch (gender) {
            case "MALE":
                return "Homem";
                break;
            case "FEMALE":
                return "Mulher";
                break;
            case "NON_BINARY":
                return "Não-binário";
                break;
            case "OTHER":
                return "Outro";
                break;
            default:
                return "-";
        }
    }
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
                <InfoTerm label={"Primeiro Nome"}>{teacher.firstName}</InfoTerm>
                <InfoTerm label={"Sobrenome"}>{teacher.lastName}</InfoTerm>
                <InfoTerm label={"E-mail"}>{teacher.email}</InfoTerm>
                <InfoTerm label={"Data de Nascimento"}>{teacherData?.dateOfBirth ? dayjs(teacherData.dateOfBirth).format("DD/MM/YYYY") : "-"}</InfoTerm>
                <InfoTerm label={"CPF"}>{teacherData?.document || "-"}</InfoTerm>
                <InfoTerm label={"Gênero"}>{renderGender(teacherData?.gender as Gender)}</InfoTerm>
                <InfoTerm label={"Pronome"}>{teacherData?.pronoun || "-"}</InfoTerm>
                <InfoTerm label={"Instagram"}>{teacherData?.instagramUser || "-"}</InfoTerm>
                <InfoTerm label={"Registro Profissional"}>{teacherData?.professionalRegister || "-"}</InfoTerm>
            </div>

             {/* Seção de Endereço */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Endereço"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={"Logradouro"}>{addressData?.publicPlace || "-"}</InfoTerm>
                <InfoTerm label={"Número"}>{addressData?.number || "-"}</InfoTerm>
                <InfoTerm label={"Complemento"}>{addressData?.complement || "-"}</InfoTerm>
                <InfoTerm label={"Bairro"}>{addressData?.neighborhood || "-"}</InfoTerm>
                <InfoTerm label={"Cidade"}>{addressData?.city || "-"}</InfoTerm>
                <InfoTerm label={"Estado"}>{addressData?.state || "-"}</InfoTerm>
                <InfoTerm label={"CEP"}>{addressData?.zipCode || "-"}</InfoTerm>
            </div>

            {/* Seção de Remuneração */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Remuneração"}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={teacherData?.remunerationType == "HOURLY" ? "Valor por Hora" : "Salário Base"}>{`R$ ${Number(teacherData?.baseAmount || 0).toFixed(2).replace(/\./g, ",")}`}</InfoTerm>
                <InfoTerm label={"Dia do Pagamento"}>{`${teacherData?.paymentDay || "-"}`}</InfoTerm>
                <InfoTerm label={"Bônus por Presença"}>{`R$ ${Number(teacherData?.bonusForPresenceAmount ?? 0).toFixed(2).replace(/\./g, ",")}`}</InfoTerm>
                <InfoTerm label={"Perde Bônus quando Ausente"}>{teacherData?.loseBonusWhenAbsent ? "Sim" : "Não"}</InfoTerm>
            </div>

             {/* Seção de Comissões */}
             {teacherData?.comissionTiers && teacherData.comissionTiers.length > 0 && (
                 <>
                    <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{"Comissões"}</h2>
                    <div className="grid gap-4 md:grid-cols-1">
                        {teacherData.comissionTiers.map((tier, index) => (
                           <div key={index} className="grid grid-cols-3 gap-4 p-2 border-b">
                               <InfoTerm label={"Mínimo de Alunos"}>{`${tier.minStudents} alunos`}</InfoTerm>
                               <InfoTerm label={"Máximo de Alunos"}>{`${tier.maxStudents} alunos`}</InfoTerm>
                               <InfoTerm label={"Comissão"}>{`R$ ${Number(tier.comission).toFixed(2).replace(/\./g, ",")}`}</InfoTerm>
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
