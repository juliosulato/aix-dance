"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslations } from "next-intl";
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
    if (value === true) return t("general.boolean.yes");
    if (value === false) return t("general.boolean.no");
    return "-";
}

export default function TeacherView({ teacher, tenancyId }: { teacher: TeacherFromApi, tenancyId: string }) {
    const [openUpdate, setOpenUpdate] = useState<boolean>(false);
    const [openUpdateAccessData, setOpenUpdateAccessData] = useState<boolean>(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const t = useTranslations();
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deactivateUsers([teacher.id], tenancyId, t as any);
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
                <h1 className="text-xl text-center md:text-left md:text-2xl font-bold">{t("academic.teachers.view.title")}</h1>
                <div className="flex gap-4 md:gap-6">
                    <button className="text-red-500 flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setConfirmModalOpen(true)}>
                        <FaTrash />
                        <span>{t("general.actions.delete")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdate(true)}>
                        <FaEdit />
                        <span>{t("general.actions.update")}</span>
                    </button>
                    <button className="text-primary flex items-center gap-2 cursor-pointer hover:opacity-50 transition" onClick={() => setOpenUpdateAccessData(true)}>
                        <FaEdit />
                        <span>{t("general.actions.updateAccessData")}</span>
                    </button>
                </div>
            </div>

            {/* Seção de Informações Pessoais */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 mb-2">{t("academic.teachers.modals.create.personalData.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("forms.general-fields.firstName.label")} children={teacher.firstName} />
                <InfoTerm label={t("forms.general-fields.lastName.label")} children={teacher.lastName} />
                <InfoTerm label={t("forms.general-fields.email.label")} children={teacher.email} />
                <InfoTerm label={t("forms.general-fields.dateOfBirth.label")} children={teacherData?.dateOfBirth ? dayjs(teacherData.dateOfBirth).format("DD/MM/YYYY") : "-"} />
                <InfoTerm label={t("forms.general-fields.document.label")} children={teacherData?.document || "-"} />
                <InfoTerm label={t("forms.general-fields.gender.label")} children={teacherData?.gender ? formatGender(teacherData.gender, t) : "-"} />
                <InfoTerm label={t("forms.general-fields.pronoun.label")} children={teacherData?.pronoun || "-"} />
                <InfoTerm label={t("forms.general-fields.instagramUser.label")} children={teacherData?.instagramUser || "-"} />
                <InfoTerm label={t("academic.teachers.modals.create.personalData.fields.professionalRegister.label")} children={teacherData?.professionalRegister || "-"} />
            </div>

             {/* Seção de Endereço */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("forms.address.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("forms.address.publicPlace.label")} children={addressData?.publicPlace || "-"} />
                <InfoTerm label={t("forms.address.number.label")} children={addressData?.number || "-"} />
                <InfoTerm label={t("forms.address.complement.label")} children={addressData?.complement || "-"} />
                <InfoTerm label={t("forms.address.neighborhood.label")} children={addressData?.neighborhood || "-"} />
                <InfoTerm label={t("forms.address.city.label")} children={addressData?.city || "-"} />
                <InfoTerm label={t("forms.address.state.label")} children={addressData?.state || "-"} />
                <InfoTerm label={t("forms.address.zipCode.label")} children={addressData?.zipCode || "-"} />
            </div>

            {/* Seção de Remuneração */}
            <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("academic.teachers.modals.create.remuneration.title")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.contractType.label")} children={teacherData?.remunerationType ? formatRemunerationType(teacherData.remunerationType, t) : "-"} />
                <InfoTerm label={teacherData?.remunerationType == "HOURLY" ? t("academic.teachers.modals.create.remuneration.fields.baseAmount.hourly") : t("academic.teachers.modals.create.remuneration.fields.baseAmount.fixed")} children={`R$ ${Number(teacherData?.baseAmount || 0).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.paymentDay.label")} children={`${teacherData?.paymentDay || "-"}`} />
                <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.presenceBonus.label")} children={`R$ ${Number(teacherData?.bonusForPresenceAmount ?? 0).toFixed(2).replace(/\./g, ",")}`} />
                <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.presenceBonus.loseBonusCheckbox")} children={formatBoolean(teacherData?.loseBonusWhenAbsent, t)} />
            </div>

             {/* Seção de Comissões */}
             {teacherData?.comissionTiers && teacherData.comissionTiers.length > 0 && (
                 <>
                    <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">{t("academic.teachers.modals.create.remuneration.fields.commission.title")}</h2>
                    <div className="grid gap-4 md:grid-cols-1">
                        {teacherData.comissionTiers.map((tier, index) => (
                           <div key={index} className="grid grid-cols-3 gap-4 p-2 border-b">
                               <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.commission.tableHeaders.from")} children={`${tier.minStudents} alunos`} />
                               <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.commission.tableHeaders.to")} children={`${tier.maxStudents} alunos`} />
                               <InfoTerm label={t("academic.teachers.modals.create.remuneration.fields.commission.tableHeaders.value")} children={`R$ ${Number(tier.comission).toFixed(2).replace(/\./g, ",")}`} />
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
                title={t("academic.teachers.modals.confirmModal.title")}
                confirmLabel={t("general.actions.delete")}
                cancelLabel={t("general.actions.cancel")}
                confirmColor="red"
                loading={isDeleting}
            >
                {t("academic.teachers.modals.confirmModal.text", {
                    teacher: teacher?.firstName + " " + teacher?.lastName || ""
                })}
            </ConfirmationModal>
        </div>
    );
}
